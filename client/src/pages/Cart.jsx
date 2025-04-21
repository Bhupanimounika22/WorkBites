import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        
        // Group cart items by restaurant
        const grouped = parsedCart.reduce((acc, item) => {
          if (!acc[item.restaurantId]) {
            acc[item.restaurantId] = {
              restaurantName: item.restaurantName,
              items: []
            };
          }
          acc[item.restaurantId].items.push(item);
          return acc;
        }, {});
        
        setGroupedCart(grouped);
      } catch (err) {
        console.error('Error parsing cart from localStorage', err);
      }
    }
  }, []);

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update grouped cart
    const grouped = updatedCart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {});
    
    setGroupedCart(grouped);
  };

  // Remove item
  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update grouped cart
    const grouped = updatedCart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {});
    
    setGroupedCart(grouped);
    
    toast.info('Item removed from cart');
  };

  // Calculate total for a restaurant
  const calculateRestaurantTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to continue with your order');
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <div className="container">
      <h1 className="mb-4">Your Cart</h1>
      
      {Object.keys(groupedCart).length > 0 ? (
        <>
          {Object.entries(groupedCart).map(([restaurantId, restaurant]) => (
            <div className="card mb-4" key={restaurantId}>
              <div className="card-header bg-light">
                <h5 className="mb-0">{restaurant.restaurantName}</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurant.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <div className="input-group input-group-sm" style={{ width: '120px' }}>
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                min="1"
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="3" className="text-end">Subtotal:</th>
                        <th>${calculateRestaurantTotal(restaurant.items).toFixed(2)}</th>
                        <th></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
          
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Total Amount:</h4>
                <h4 className="mb-0">${cartTotal.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <Link to="/restaurants" className="btn btn-outline-primary">
              Continue Shopping
            </Link>
            <button
              className="btn btn-primary"
              onClick={proceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="text-center my-5">
          <i className="bi bi-cart3 fs-1 text-muted mb-3"></i>
          <h3>Your cart is empty</h3>
          <p className="text-muted">Add items to your cart to continue</p>
          <Link to="/restaurants" className="btn btn-primary mt-3">
            Browse Restaurants
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;