import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

// Restaurant Dashboard Components
const RestaurantHome = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalMenuItems: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantAndStats = async () => {
      try {
        // First, get the restaurant owned by this user
        const restaurantsRes = await axios.get('/api/restaurants');
        const userRestaurant = restaurantsRes.data.data.find(
          (r) => r.owner === user.id
        );
        
        if (!userRestaurant) {
          setLoading(false);
          return;
        }
        
        setRestaurant(userRestaurant);
        
        // Get orders for this restaurant
        const ordersRes = await axios.get('/api/orders');
        const restaurantOrders = ordersRes.data.data.filter(
          (order) => order.restaurant._id === userRestaurant._id
        );
        
        // Get menu items for this restaurant
        const menuRes = await axios.get(`/api/menu/restaurant/${userRestaurant._id}`);
        
        // Calculate stats
        const pendingOrders = restaurantOrders.filter(
          (order) => !['completed', 'cancelled'].includes(order.status)
        );
        
        const completedOrders = restaurantOrders.filter(
          (order) => order.status === 'completed'
        );
        
        setStats({
          totalOrders: restaurantOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          totalMenuItems: menuRes.data.count,
          recentOrders: restaurantOrders.slice(0, 5) // Get 5 most recent orders
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurant stats:', err);
        setLoading(false);
      }
    };

    if (user) {
      fetchRestaurantAndStats();
    }
  }, [user]);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center my-5">
        <i className="bi bi-shop-window fs-1 text-muted mb-3"></i>
        <h3>No Restaurant Found</h3>
        <p className="text-muted">
          You don't have a restaurant set up yet. Please create one to continue.
        </p>
        <Link to="/restaurant-dashboard/create" className="btn btn-primary mt-3">
          Create Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Restaurant Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <p className="card-text display-4">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Pending Orders</h5>
              <p className="card-text display-4">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Completed Orders</h5>
              <p className="card-text display-4">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Menu Items</h5>
              <p className="card-text display-4">{stats.totalMenuItems}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </div>
            <div className="card-body">
              {stats.recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Pickup Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.substring(0, 8)}</td>
                          <td>{order.user.name}</td>
                          <td>{order.items.length} items</td>
                          <td>${order.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'completed' ? 'bg-success' :
                              order.status === 'cancelled' ? 'bg-danger' :
                              order.status === 'ready' ? 'bg-info' :
                              'bg-warning'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td>{formatDate(order.pickupTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center mb-0">No recent orders found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageMenu = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main course',
    preparationTime: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true
  });
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // First, get the restaurant owned by this user
        const restaurantsRes = await axios.get('/api/restaurants');
        const userRestaurant = restaurantsRes.data.data.find(
          (r) => r.owner === user.id
        );
        
        if (!userRestaurant) {
          setLoading(false);
          return;
        }
        
        setRestaurant(userRestaurant);
        
        // Get menu items for this restaurant
        const menuRes = await axios.get(`/api/menu/restaurant/${userRestaurant._id}`);
        setMenuItems(menuRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch menu items');
        setLoading(false);
      }
    };

    if (user) {
      fetchRestaurantAndMenu();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const menuItemData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        restaurant: restaurant._id
      };
      
      if (editingItemId) {
        // Update existing menu item
        await axios.put(`/api/menu/${editingItemId}`, menuItemData);
        toast.success('Menu item updated successfully');
        
        // Update the menu items list
        setMenuItems(menuItems.map(item => 
          item._id === editingItemId ? { ...item, ...menuItemData } : item
        ));
      } else {
        // Create new menu item
        const res = await axios.post('/api/menu', menuItemData);
        toast.success('Menu item added successfully');
        
        // Add the new item to the list
        setMenuItems([...menuItems, res.data.data]);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'main course',
        preparationTime: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isAvailable: true
      });
      setEditingItemId(null);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isAvailable: item.isAvailable
    });
    setEditingItemId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`/api/menu/${itemId}`);
        toast.success('Menu item deleted successfully');
        
        // Remove the item from the list
        setMenuItems(menuItems.filter(item => item._id !== itemId));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      await axios.put(`/api/menu/${itemId}`, { isAvailable: !currentStatus });
      
      // Update the menu items list
      setMenuItems(menuItems.map(item => 
        item._id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
      
      toast.success(`Item ${!currentStatus ? 'available' : 'unavailable'} now`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center my-5">
        <i className="bi bi-shop-window fs-1 text-muted mb-3"></i>
        <h3>No Restaurant Found</h3>
        <p className="text-muted">
          You don't have a restaurant set up yet. Please create one to continue.
        </p>
        <Link to="/restaurant-dashboard/create" className="btn btn-primary mt-3">
          Create Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Menu</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingItemId(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'main course',
                preparationTime: '',
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false,
                isAvailable: true
              });
            }
          }}
        >
          {showForm ? 'Cancel' : 'Add Menu Item'}
        </button>
      </div>
      
      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">{editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Item Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="price" className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main course">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                    <option value="side dish">Side Dish</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="preparationTime" className="form-label">Preparation Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    id="preparationTime"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isVegetarian"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isVegetarian">
                      Vegetarian
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isVegan"
                      name="isVegan"
                      checked={formData.isVegan}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isVegan">
                      Vegan
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isGlutenFree"
                      name="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isGlutenFree">
                      Gluten Free
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isAvailable">
                      Available
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="text-end">
                <button type="submit" className="btn btn-primary">
                  {editingItemId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {menuItems.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Prep Time</th>
                      <th>Dietary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>{item.preparationTime} mins</td>
                        <td>
                          {item.isVegetarian && (
                            <span className="badge bg-success me-1">Veg</span>
                          )}
                          {item.isVegan && (
                            <span className="badge bg-success me-1">Vegan</span>
                          )}
                          {item.isGlutenFree && (
                            <span className="badge bg-info me-1">GF</span>
                          )}
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={item.isAvailable}
                              onChange={() => toggleAvailability(item._id, item.isAvailable)}
                            />
                            <label className="form-check-label">
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </label>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center my-5">
                <i className="bi bi-menu-button-wide fs-1 text-muted mb-3"></i>
                <h3>No Menu Items</h3>
                <p className="text-muted">
                  You haven't added any menu items yet. Click the "Add Menu Item" button to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ManageOrders = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Function to check if an order is scheduled (more than 2 hours in the future)
  const isScheduledOrder = (order) => {
    const pickupTime = new Date(order.pickupTime);
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return pickupTime > twoHoursFromNow;
  };

  useEffect(() => {
    const fetchRestaurantAndOrders = async () => {
      try {
        // First, get the restaurant owned by this user
        const restaurantsRes = await axios.get('/api/restaurants');
        const userRestaurant = restaurantsRes.data.data.find(
          (r) => r.owner === user.id
        );
        
        if (!userRestaurant) {
          setLoading(false);
          return;
        }
        
        setRestaurant(userRestaurant);
        
        // Get orders for this restaurant
        const ordersRes = await axios.get('/api/orders');
        const restaurantOrders = ordersRes.data.data.filter(
          (order) => order.restaurant._id === userRestaurant._id
        );
        
        setOrders(restaurantOrders);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    if (user) {
      fetchRestaurantAndOrders();
    }
  }, [user]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return ['pending', 'confirmed', 'preparing'].includes(order.status) && !isScheduledOrder(order);
    } else if (activeTab === 'ready') {
      return order.status === 'ready';
    } else if (activeTab === 'completed') {
      return order.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return order.status === 'cancelled';
    } else if (activeTab === 'scheduled') {
      // Show all scheduled orders that aren't cancelled or completed
      return isScheduledOrder(order) && !['cancelled', 'completed'].includes(order.status);
    }
    return true;
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      // Find the order to get customer info
      const orderToUpdate = orders.find(order => order._id === orderId);
      if (!orderToUpdate) {
        toast.error('Order not found');
        return;
      }
      
      // Show loading toast for better UX
      const loadingToastId = toast.loading(
        status === 'completed' 
          ? 'Marking order as completed and notifying customer...' 
          : `Updating order status to ${status}...`
      );
      
      // Make the API call
      await axios.put(`/api/orders/${orderId}`, { status });
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show appropriate success message
      if (status === 'completed') {
        toast.success(
          <div>
            <strong>Order completed successfully!</strong>
            <p className="mb-0 mt-1">
              Customer {orderToUpdate.user.name} has been notified that their order is ready for pickup.
            </p>
            <p className="mb-0 mt-1 small">
              <i className="bi bi-info-circle me-1"></i>
              The order will now appear in their order history and they will receive a notification.
            </p>
          </div>, 
          { autoClose: 8000 }
        );
      } else if (status === 'ready') {
        toast.success(
          <div>
            <strong>Order is ready for pickup!</strong>
            <p className="mb-0 mt-1">
              When the customer picks up their order, click "Mark as Done & Notify Customer".
            </p>
            <p className="mb-0 mt-1 small">
              <i className="bi bi-bell me-1"></i>
              This will notify the customer and update their order history.
            </p>
          </div>, 
          { autoClose: 8000 }
        );
      } else {
        toast.success(
          <div>
            <strong>Order status updated!</strong>
            <p className="mb-0 mt-1">
              Order status has been changed to "{status}".
            </p>
          </div>,
          { autoClose: 5000 }
        );
      }
      
      // If order is completed, we could also send a notification to the customer
      // This would typically be handled by the backend, but we can simulate it here
      if (status === 'completed') {
        // In a real app, this would trigger a notification to the customer
        // For now, we'll just log it
        console.log(`Notification sent to customer ${orderToUpdate.user.name} for order ${orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center my-5">
        <i className="bi bi-shop-window fs-1 text-muted mb-3"></i>
        <h3>No Restaurant Found</h3>
        <p className="text-muted">
          You don't have a restaurant set up yet. Please create one to continue.
        </p>
        <Link to="/restaurant-dashboard/create" className="btn btn-primary mt-3">
          Create Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Manage Orders</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="bi bi-hourglass-split me-1"></i> Pending
            {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status) && !isScheduledOrder(o)).length > 0 && (
              <span className="badge bg-danger ms-1">
                {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status) && !isScheduledOrder(o)).length}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <i className="bi bi-calendar-check me-1"></i> Scheduled
            {orders.filter(o => isScheduledOrder(o) && !['cancelled', 'completed'].includes(o.status)).length > 0 && (
              <span className="badge bg-info ms-1">
                {orders.filter(o => isScheduledOrder(o) && !['cancelled', 'completed'].includes(o.status)).length}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ready' ? 'active' : ''}`}
            onClick={() => setActiveTab('ready')}
          >
            <i className="bi bi-bag-check me-1"></i> Ready for Pickup
            {orders.filter(o => o.status === 'ready').length > 0 && (
              <span className="badge bg-success ms-1">
                {orders.filter(o => o.status === 'ready').length}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <i className="bi bi-check-circle me-1"></i> Completed
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            <i className="bi bi-x-circle me-1"></i> Cancelled
          </button>
        </li>
      </ul>
      
      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {filteredOrders.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Pickup Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.substring(0, 8)}</td>
                          <td>
                            {order.user.name}<br />
                            <small className="text-muted">{order.user.phone}</small>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-link"
                              data-bs-toggle="modal"
                              data-bs-target={`#orderDetails-${order._id}`}
                            >
                              {order.items.length} items
                            </button>
                            
                            {/* Order Details Modal */}
                            <div className="modal fade" id={`orderDetails-${order._id}`} tabIndex="-1" aria-hidden="true">
                              <div className="modal-dialog">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">Order Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                  </div>
                                  <div className="modal-body">
                                    <table className="table table-sm">
                                      <thead>
                                        <tr>
                                          <th>Item</th>
                                          <th>Quantity</th>
                                          <th>Price</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items.map((item, index) => (
                                          <tr key={index}>
                                            <td>{item.menuItem.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.price.toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr>
                                          <th colSpan="2">Total:</th>
                                          <th>${order.totalAmount.toFixed(2)}</th>
                                        </tr>
                                      </tfoot>
                                    </table>
                                    
                                    {order.specialInstructions && (
                                      <div className="mt-3">
                                        <h6>Special Instructions:</h6>
                                        <p>{order.specialInstructions}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>${order.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'completed' ? 'bg-success' :
                              order.status === 'cancelled' ? 'bg-danger' :
                              order.status === 'ready' ? 'bg-info' :
                              'bg-warning'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td>{formatDate(order.pickupTime)}</td>
                          <td>
                            {activeTab !== 'completed' && activeTab !== 'cancelled' && (
                              <>
                                {order.status === 'ready' ? (
                                  <button
                                    className="btn btn-sm btn-success fw-bold"
                                    onClick={() => updateOrderStatus(order._id, 'completed')}
                                  >
                                    <i className="bi bi-check-circle me-1"></i> Mark as Done & Notify Customer
                                  </button>
                                ) : (
                                  <div className="dropdown">
                                    <button
                                      className="btn btn-sm btn-outline-primary dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      Update Status
                                    </button>
                                    <ul className="dropdown-menu">
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                                        >
                                          Confirmed
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                                        >
                                          Preparing
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => updateOrderStatus(order._id, 'ready')}
                                        >
                                          Ready for Pickup
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => updateOrderStatus(order._id, 'completed')}
                                        >
                                          Completed
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item text-danger"
                                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                        >
                                          Cancelled
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center my-5">
              <i className="bi bi-bag-x fs-1 text-muted mb-3"></i>
              <h3>No {activeTab} orders found</h3>
              <p className="text-muted">
                There are no orders in this category at the moment.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RestaurantProfile = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: [],
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    openingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' }
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cuisineInput, setCuisineInput] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Get the restaurant owned by this user
        const restaurantsRes = await axios.get('/api/restaurants');
        const userRestaurant = restaurantsRes.data.data.find(
          (r) => r.owner === user.id
        );
        
        if (userRestaurant) {
          setRestaurant(userRestaurant);
          setFormData({
            name: userRestaurant.name || '',
            description: userRestaurant.description || '',
            cuisine: userRestaurant.cuisine || [],
            phone: userRestaurant.phone || '',
            email: userRestaurant.email || '',
            address: {
              street: userRestaurant.address?.street || '',
              city: userRestaurant.address?.city || '',
              state: userRestaurant.address?.state || '',
              zipCode: userRestaurant.address?.zipCode || '',
              country: userRestaurant.address?.country || 'USA'
            },
            openingHours: userRestaurant.openingHours || {
              monday: { open: '09:00', close: '21:00' },
              tuesday: { open: '09:00', close: '21:00' },
              wednesday: { open: '09:00', close: '21:00' },
              thursday: { open: '09:00', close: '21:00' },
              friday: { open: '09:00', close: '22:00' },
              saturday: { open: '10:00', close: '22:00' },
              sunday: { open: '10:00', close: '21:00' }
            }
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurant details');
        setLoading(false);
      }
    };

    if (user) {
      fetchRestaurant();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleHoursChange = (day, type, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [type]: value
        }
      }
    });
  };

  const addCuisine = () => {
    if (cuisineInput.trim() && !formData.cuisine.includes(cuisineInput.trim())) {
      setFormData({
        ...formData,
        cuisine: [...formData.cuisine, cuisineInput.trim()]
      });
      setCuisineInput('');
    }
  };

  const removeCuisine = (index) => {
    const updatedCuisine = [...formData.cuisine];
    updatedCuisine.splice(index, 1);
    setFormData({
      ...formData,
      cuisine: updatedCuisine
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (restaurant) {
        // Update existing restaurant
        await axios.put(`/api/restaurants/${restaurant._id}`, formData);
        toast.success('Restaurant profile updated successfully');
      } else {
        // Create new restaurant
        const res = await axios.post('/api/restaurants', formData);
        setRestaurant(res.data.data);
        toast.success('Restaurant created successfully');
      }
      
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save restaurant profile');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{restaurant ? 'Restaurant Profile' : 'Create Restaurant'}</h2>
        {restaurant && !isEditing && (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {isEditing || !restaurant ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Restaurant Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Cuisine Types</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add cuisine type"
                      value={cuisineInput}
                      onChange={(e) => setCuisineInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={addCuisine}
                    >
                      Add
                    </button>
                  </div>
                  <div>
                    {formData.cuisine.map((cuisine, index) => (
                      <span key={index} className="badge bg-primary me-2 mb-2">
                        {cuisine}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.5rem' }}
                          onClick={() => removeCuisine(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <h5 className="mt-4 mb-3">Address</h5>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="address.street" className="form-label">Street</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="address.city" className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="address.state" className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="address.zipCode" className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <h5 className="mt-4 mb-3">Opening Hours</h5>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div className="row mb-3" key={day}>
                    <div className="col-md-2">
                      <label className="form-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                    </div>
                    <div className="col-md-5">
                      <label htmlFor={`${day}-open`} className="form-label">Open</label>
                      <input
                        type="time"
                        className="form-control"
                        id={`${day}-open`}
                        value={formData.openingHours[day].open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label htmlFor={`${day}-close`} className="form-label">Close</label>
                      <input
                        type="time"
                        className="form-control"
                        id={`${day}-close`}
                        value={formData.openingHours[day].close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
                
                <div className="text-end mt-4">
                  {restaurant && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {restaurant ? 'Update Profile' : 'Create Restaurant'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h3>{restaurant.name}</h3>
                    <p className="text-muted">
                      {restaurant.cuisine.join(', ')}
                    </p>
                    <p>{restaurant.description}</p>
                    
                    <h5 className="mt-4">Contact Information</h5>
                    <p>
                      <i className="bi bi-telephone-fill me-2"></i> {restaurant.phone}<br />
                      <i className="bi bi-envelope-fill me-2"></i> {restaurant.email}<br />
                      <i className="bi bi-geo-alt-fill me-2"></i> 
                      {restaurant.address?.street}, {restaurant.address?.city}, {restaurant.address?.state} {restaurant.address?.zipCode}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <img
                      src={`https://source.unsplash.com/random/300x200/?restaurant,${restaurant.cuisine[0]}`}
                      alt={restaurant.name}
                      className="img-fluid rounded"
                    />
                  </div>
                </div>
                
                <h5>Opening Hours</h5>
                <div className="row">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div className="col-md-6 mb-2" key={day}>
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <span>
                          {restaurant.openingHours?.[day]?.open} - {restaurant.openingHours?.[day]?.close}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active link based on current path
  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="container">
      <h1 className="mb-4">Restaurant Dashboard</h1>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group">
            <Link
              to="/restaurant-dashboard"
              className={`list-group-item list-group-item-action ${getActiveClass('/restaurant-dashboard')}`}
            >
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
            <Link
              to="/restaurant-dashboard/menu"
              className={`list-group-item list-group-item-action ${getActiveClass('/restaurant-dashboard/menu')}`}
            >
              <i className="bi bi-menu-button-wide me-2"></i> Manage Menu
            </Link>
            <Link
              to="/restaurant-dashboard/orders"
              className={`list-group-item list-group-item-action ${getActiveClass('/restaurant-dashboard/orders')}`}
            >
              <i className="bi bi-bag me-2"></i> Manage Orders
            </Link>
            <Link
              to="/restaurant-dashboard/profile"
              className={`list-group-item list-group-item-action ${getActiveClass('/restaurant-dashboard/profile')}`}
            >
              <i className="bi bi-shop me-2"></i> Restaurant Profile
            </Link>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <Routes>
                <Route path="/" element={<RestaurantHome />} />
                <Route path="/menu" element={<ManageMenu />} />
                <Route path="/orders" element={<ManageOrders />} />
                <Route path="/profile" element={<RestaurantProfile />} />
                <Route path="/create" element={<RestaurantProfile />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;