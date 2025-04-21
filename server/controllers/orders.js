const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
exports.getOrders = async (req, res) => {
  try {
    let query;
    
    // If user is not admin, show only their orders
    if (req.user.role !== 'admin') {
      if (req.user.role === 'restaurant') {
        // Find restaurants owned by this user
        const restaurants = await Restaurant.find({ owner: req.user.id });
        const restaurantIds = restaurants.map(restaurant => restaurant._id);
        
        // Find orders for these restaurants
        query = Order.find({ restaurant: { $in: restaurantIds } });
      } else {
        // Regular user - show only their orders
        query = Order.find({ user: req.user.id });
      }
    } else {
      // Admin can see all orders
      query = Order.find();
    }
    
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Populate with related data
    query = query
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('items.menuItem', 'name price');
    
    // Execute query
    const orders = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: orders.length,
      pagination,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('items.menuItem', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Make sure user is order owner, restaurant owner, or admin
    if (
      order.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      // Check if user is restaurant owner
      const restaurant = await Restaurant.findById(order.restaurant);
      if (!restaurant || restaurant.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { restaurant, items, pickupTime, specialInstructions, paymentMethod } = req.body;
    
    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Validate items and calculate total
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order'
      });
    }
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Validate each item and calculate total
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItem} not found`
        });
      }
      
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price
      });
    }
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant,
      items: orderItems,
      totalAmount,
      pickupTime,
      specialInstructions,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Admin/Restaurant Owner)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is admin or restaurant owner
    if (req.user.role !== 'admin') {
      const restaurant = await Restaurant.findById(order.restaurant);
      
      if (!restaurant || restaurant.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this order'
        });
      }
    }
    
    // Update fields
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is order owner, admin, or restaurant owner
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const restaurant = await Restaurant.findById(order.restaurant);
      
      if (!restaurant || restaurant.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this order'
        });
      }
    }
    
    // Check if order can be cancelled (not already completed or cancelled)
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.status}`
      });
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};