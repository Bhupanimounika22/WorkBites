import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axiosConfig';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [pickupTimes, setPickupTimes] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState({});
  // Make sure this matches the enum in the server model: 'credit_card', 'debit_card', 'cash', 'online_payment'
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        if (parsedCart.length === 0) {
          toast.info('Your cart is empty');
          navigate('/cart');
          return;
        }
        
        setCart(parsedCart);
        
        // Group cart items by restaurant
        const grouped = parsedCart.reduce((acc, item) => {
          if (!acc[item.restaurantId]) {
            acc[item.restaurantId] = {
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName,
              items: []
            };
          }
          acc[item.restaurantId].items.push(item);
          return acc;
        }, {});
        
        setGroupedCart(grouped);
        
        // Initialize pickup times (45 minutes from now by default to ensure it's valid)
        const initialPickupTimes = {};
        const initialInstructions = {};
        
        Object.keys(grouped).forEach(restaurantId => {
          // Create a date 45 minutes from now (30 minutes minimum + 15 minutes buffer)
          const pickupTime = new Date();
          pickupTime.setMinutes(pickupTime.getMinutes() + 45);
          
          // Round to the nearest 5 minutes for better UX
          pickupTime.setMinutes(Math.ceil(pickupTime.getMinutes() / 5) * 5);
          
          // Format to YYYY-MM-DDThh:mm
          const formattedTime = pickupTime.toISOString().slice(0, 16);
          
          console.log(`Default pickup time for restaurant ${restaurantId}:`, formattedTime);
          console.log(`Default pickup time in IST:`, formatISTTime(pickupTime));
          
          initialPickupTimes[restaurantId] = formattedTime;
          initialInstructions[restaurantId] = '';
        });
        
        setPickupTimes(initialPickupTimes);
        setSpecialInstructions(initialInstructions);
      } catch (err) {
        console.error('Error parsing cart from localStorage', err);
        toast.error('There was an error loading your cart');
        navigate('/cart');
      }
    } else {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [navigate]);
  
  // Calculate total for a restaurant
  const calculateRestaurantTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Handle pickup time change
  const handlePickupTimeChange = (restaurantId, time) => {
    // Validate the time as the user types
    const isValid = validatePickupTime(time);
    
    // Set the time regardless of validity (we'll validate on submit)
    setPickupTimes({
      ...pickupTimes,
      [restaurantId]: time
    });
    
    // Provide immediate feedback if the time is invalid
    if (!isValid && time) {
      // Get the restaurant name
      const restaurant = groupedCart[restaurantId];
      const restaurantName = restaurant?.restaurantName || "this restaurant";
      
      // Check if the time is too soon or too far in the future
      const pickupTime = new Date(time);
      const now = new Date();
      const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days from now
      
      let warningMessage = '';
      
      if (pickupTime < minTime) {
        warningMessage = `The selected time for ${restaurantName} should be at least 30 minutes from now.`;
      } else if (pickupTime > maxTime) {
        warningMessage = `The selected time for ${restaurantName} should be within 7 days from now.`;
      }
      
      // Show a warning toast (less intrusive than an error)
      toast.warn(
        <div>
          <strong>Pickup Time Warning</strong>
          <p className="mb-0 mt-1">{warningMessage}</p>
        </div>,
        { 
          autoClose: 3000,
          toastId: `pickup-warning-${restaurantId}` // Prevent duplicate toasts
        }
      );
    } else if (isValid && time) {
      // Show a success toast for valid time selection
      const restaurant = groupedCart[restaurantId];
      const restaurantName = restaurant?.restaurantName || "this restaurant";
      
      toast.success(
        <div>
          <strong>Pickup Time Scheduled</strong>
          <p className="mb-0 mt-1">
            Your order from {restaurantName} is scheduled for pickup at {formatISTTime(new Date(time))}.
          </p>
        </div>,
        { 
          autoClose: 2000,
          toastId: `pickup-success-${restaurantId}` // Prevent duplicate toasts
        }
      );
    }
  };
  
  // Handle special instructions change
  const handleInstructionsChange = (restaurantId, instructions) => {
    setSpecialInstructions({
      ...specialInstructions,
      [restaurantId]: instructions
    });
  };
  
  // Convert to Indian Standard Time (IST)
  const convertToIST = (date) => {
    // IST is UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    return new Date(utcTime + istOffset);
  };

  // Format time for display in IST
  const formatISTTime = (date) => {
    const istDate = convertToIST(date);
    return istDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Validate pickup time
  const validatePickupTime = (pickupTimeStr) => {
    try {
      if (!pickupTimeStr) return false;
      
      const pickupTime = new Date(pickupTimeStr);
      
      // Check if the date is valid
      if (isNaN(pickupTime.getTime())) return false;
      
      const now = new Date();
      const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days from now
      
      // Convert to IST for logging
      const istPickupTime = formatISTTime(pickupTime);
      const istMinTime = formatISTTime(minTime);
      const istMaxTime = formatISTTime(maxTime);
      const istNow = formatISTTime(now);
      
      console.log('Validating pickup time (IST):', {
        now: istNow,
        pickupTime: istPickupTime,
        minTime: istMinTime,
        maxTime: istMaxTime,
        isValid: pickupTime >= minTime && pickupTime <= maxTime
      });
      
      // Check if the pickup time is between the minimum and maximum allowed times
      const isAfterMinTime = pickupTime >= minTime;
      const isBeforeMaxTime = pickupTime <= maxTime;
      
      if (!isAfterMinTime) {
        console.log('Pickup time is too soon - must be at least 30 minutes from now');
      }
      
      if (!isBeforeMaxTime) {
        console.log('Pickup time is too far in the future - must be within 7 days');
      }
      
      return isAfterMinTime && isBeforeMaxTime;
    } catch (err) {
      console.error('Error validating pickup time:', err);
      return false;
    }
  };

  // Check server connection with fallback
  const checkServerConnection = async () => {
    // Try multiple server URLs in case one fails
    const serverUrls = [
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
    
    console.log('Checking server connection...');
    
    for (const serverUrl of serverUrls) {
      try {
        console.log(`Trying server at ${serverUrl}...`);
        
        // Create a new axios instance with this base URL
        const axiosInstance = axios.create({
          baseURL: serverUrl,
          timeout: 3000,  // 3 second timeout
          headers: { 'Accept': 'application/json' }
        });
        
        // Use a simple endpoint that doesn't require authentication
        const response = await axiosInstance.get('/api/restaurants');
        
        console.log(`Server connection successful at ${serverUrl}:`, response.status);
        
        // Update the global axios baseURL to use this working server
        axios.defaults.baseURL = serverUrl;
        console.log('Updated axios baseURL to:', serverUrl);
        
        return true;
      } catch (err) {
        console.error(`Server connection error for ${serverUrl}:`, err.message);
        // Continue to the next URL
      }
    }
    
    // If we get here, all server URLs failed
    console.error('All server connection attempts failed');
    return false;
  };

  // Place order
  const placeOrder = async () => {
    setLoading(true);
    
    // Check if user is authenticated
    if (!user) {
      // Store cart and pickup times in localStorage before redirecting
      localStorage.setItem('pendingCheckout', 'true');
      
      toast.info(
        <div>
          <strong>Authentication Required</strong>
          <p className="mb-0 mt-1">
            Please log in or sign up to complete your order. Your cart will be saved.
          </p>
        </div>,
        { autoClose: 5000 }
      );
      
      setLoading(false);
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Check server connection first
    const isServerConnected = await checkServerConnection();
    if (!isServerConnected) {
      toast.error(
        <div>
          <strong>Server Connection Error</strong>
          <p className="mb-0 mt-1">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <p className="mb-0 mt-1 small">
            <i className="bi bi-info-circle me-1"></i>
            Make sure the server is running. We tried connecting to multiple server URLs but all failed.
          </p>
          <p className="mb-0 mt-1 small">
            <i className="bi bi-terminal me-1"></i>
            Try running <code>cd ../server && PORT=5001 node index.js</code> in a terminal to start the server.
          </p>
        </div>,
        { autoClose: 15000 }
      );
      setLoading(false);
      return;
    }
    
    // Validate all pickup times first
    let invalidPickupTime = false;
    Object.entries(pickupTimes).forEach(([restaurantId, time]) => {
      if (!validatePickupTime(time)) {
        invalidPickupTime = true;
        // Get the restaurant name from the grouped cart
        const restaurant = groupedCart[restaurantId];
        const restaurantName = restaurant?.restaurantName || "this restaurant";
        
        toast.error(
          <div>
            <strong>Invalid Pickup Time</strong>
            <p className="mb-0 mt-1">
              Please select a pickup time at least 30 minutes from now for <b>{restaurantName}</b>.
            </p>
          </div>,
          { autoClose: 6000 }
        );
      }
    });
    
    if (invalidPickupTime) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Placing order with pickup times:', pickupTimes);
      
      // Create an order for each restaurant
      const orderPromises = Object.entries(groupedCart).map(async ([restaurantId, restaurant]) => {
        const orderItems = restaurant.items.map(item => ({
          menuItem: item.id,
          quantity: item.quantity
        }));
        
        const pickupTime = new Date(pickupTimes[restaurantId]);
        console.log(`Pickup time for ${restaurant.restaurantName}:`, pickupTime.toISOString());
        console.log(`Pickup time in IST for ${restaurant.restaurantName}:`, formatISTTime(pickupTime));
        
        const orderData = {
          restaurant: restaurantId,
          items: orderItems,
          pickupTime: pickupTime.toISOString(),
          specialInstructions: specialInstructions[restaurantId],
          paymentMethod,
          status: 'pending' // Initial status is pending
        };
        
        console.log('Sending order data:', orderData);
        
        try {
          // Add a timeout to the request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await axios.post('/api/orders', orderData, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          console.log('Order response:', response.data);
          return response;
        } catch (error) {
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
            throw new Error('Request timed out. Please try again.');
          }
          
          console.error('Error posting order:', error.response?.data || error.message);
          throw error;
        }
      });
      
      const orderResponses = await Promise.all(orderPromises);
      
      // Log order IDs for tracking
      const orderIds = orderResponses.map(response => response.data.data._id);
      console.log('Orders placed with IDs:', orderIds);
      
      // Store order IDs in localStorage for reference
      localStorage.setItem('lastOrderIds', JSON.stringify(orderIds));
      
      // Store pickup times in localStorage for reference
      const pickupTimesForStorage = {};
      const scheduledOrders = [];
      
      Object.entries(pickupTimes).forEach(([restaurantId, time]) => {
        const restaurant = groupedCart[restaurantId];
        const restaurantName = restaurant?.restaurantName || "Restaurant";
        const pickupTime = new Date(time);
        
        pickupTimesForStorage[restaurantId] = {
          time,
          restaurantName
        };
        
        // Check if this is a scheduled order (more than 2 hours in the future)
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        if (pickupTime > twoHoursFromNow) {
          scheduledOrders.push({
            restaurantName,
            pickupTime: formatISTTime(pickupTime)
          });
        }
      });
      
      localStorage.setItem('lastPickupTimes', JSON.stringify(pickupTimesForStorage));
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Show success message with scheduled order information
      if (scheduledOrders.length > 0) {
        toast.success(
          <div>
            <strong>Scheduled Order Placed Successfully!</strong>
            <p className="mb-0 mt-1">
              Your order has been scheduled for future pickup.
            </p>
            <ul className="mb-0 mt-1 ps-3">
              {scheduledOrders.map((order, index) => (
                <li key={index}>
                  <small>{order.restaurantName}: {order.pickupTime}</small>
                </li>
              ))}
            </ul>
            <p className="mb-0 mt-1 small">
              <i className="bi bi-info-circle me-1"></i>
              You can view your scheduled orders in your order history.
            </p>
          </div>,
          { autoClose: 8000 }
        );
      } else {
        toast.success('Your order has been placed successfully!');
      }
      
      // Remove pendingCheckout flag if it exists
      localStorage.removeItem('pendingCheckout');
      
      // Determine which tab to show based on whether there are scheduled orders
      const targetTab = scheduledOrders.length > 0 ? 'scheduled' : 'upcoming';
      
      // Show a final confirmation toast
      toast.success(
        <div>
          <strong>Order Confirmed!</strong>
          <p className="mb-0 mt-1">
            Redirecting to your dashboard where you can track your order.
          </p>
        </div>,
        { autoClose: 3000 }
      );
      
      // Redirect to user dashboard with appropriate tab
      setTimeout(() => {
        navigate(`/user-dashboard?tab=${targetTab}`);
      }, 1000);
    } catch (err) {
      console.error('Error placing order:', err);
      
      // Get detailed error message
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      // Log detailed error information
      console.error('Error details:', {
        response: err.response?.data,
        message: err.message,
        pickupTimes,
        paymentMethod
      });
      
      toast.error(
        <div>
          <strong>Order Failed</strong>
          <p className="mb-0 mt-1">{errorMessage}</p>
          <p className="mb-0 mt-1">Please check your pickup time and try again.</p>
          <p className="mb-0 mt-1 small">
            <i className="bi bi-info-circle me-1"></i>
            Make sure your selected time is at least 30 minutes from now in Indian Standard Time (IST).
          </p>
        </div>,
        { autoClose: 10000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Checkout</h1>
      
      {Object.keys(groupedCart).length > 0 ? (
        <>
          <div className="row">
            <div className="col-md-8">
              {/* Order Details */}
              {Object.entries(groupedCart).map(([restaurantId, restaurant]) => (
                <div className="card mb-4" key={restaurantId}>
                  <div className="card-header bg-light">
                    <h5 className="mb-0">{restaurant.restaurantName}</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive mb-3">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {restaurant.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th colSpan="3" className="text-end">Subtotal:</th>
                            <th>${calculateRestaurantTotal(restaurant.items).toFixed(2)}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor={`pickup-time-${restaurantId}`} className="form-label fw-bold">
                        Schedule Your Pickup Time
                      </label>
                      <div className="input-group mb-2">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-calendar-check"></i>
                        </span>
                        <input
                          type="datetime-local"
                          className={`form-control form-control-lg ${pickupTimes[restaurantId] && !validatePickupTime(pickupTimes[restaurantId]) ? 'is-invalid' : ''}`}
                          id={`pickup-time-${restaurantId}`}
                          value={pickupTimes[restaurantId] || ''}
                          onChange={(e) => handlePickupTimeChange(restaurantId, e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          required
                        />
                      </div>
                      {pickupTimes[restaurantId] && !validatePickupTime(pickupTimes[restaurantId]) && (
                        <div className="invalid-feedback d-block text-danger mb-2">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Please select a time at least 30 minutes from now
                        </div>
                      )}
                      <div className="form-text mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        You can schedule your pickup for any time at least 30 minutes from now, up to 7 days in advance.
                      </div>
                      <div className="form-text text-danger">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        <strong>Important:</strong> Orders with pickup times less than 30 minutes from now cannot be processed
                      </div>
                      {pickupTimes[restaurantId] && validatePickupTime(pickupTimes[restaurantId]) && (
                        <div className="alert alert-success mt-2 mb-0 py-2">
                          <small>
                            <i className="bi bi-clock me-1"></i>
                            Your food will be ready for pickup at: <strong>{formatISTTime(new Date(pickupTimes[restaurantId]))}</strong>
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor={`instructions-${restaurantId}`} className="form-label">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id={`instructions-${restaurantId}`}
                        rows="2"
                        value={specialInstructions[restaurantId] || ''}
                        onChange={(e) => handleInstructionsChange(restaurantId, e.target.value)}
                        placeholder="Any special requests or dietary requirements?"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Payment Method */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Payment Method</h5>
                </div>
                <div className="card-body">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cash"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <label className="form-check-label" htmlFor="cash">
                      Cash on Pickup
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="credit_card"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                    />
                    <label className="form-check-label" htmlFor="credit_card">
                      Credit Card on Pickup
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="online_payment"
                      value="online_payment"
                      checked={paymentMethod === 'online_payment'}
                      onChange={() => setPaymentMethod('online_payment')}
                      disabled
                    />
                    <label className="form-check-label" htmlFor="online_payment">
                      Online Payment (Coming Soon)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              {/* Order Summary */}
              <div className="card sticky-top" style={{ top: '20px' }}>
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>Customer Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {user?.name}</p>
                    <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                    <p className="mb-0"><strong>Phone:</strong> {user?.phone}</p>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <h6>Order Details</h6>
                    {Object.entries(groupedCart).map(([restaurantId, restaurant]) => (
                      <div key={restaurantId} className="mb-2">
                        <p className="mb-1"><strong>{restaurant.restaurantName}</strong></p>
                        <p className="mb-1">
                          <small>
                            {restaurant.items.length} {restaurant.items.length === 1 ? 'item' : 'items'} - 
                            ${calculateRestaurantTotal(restaurant.items).toFixed(2)}
                          </small>
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    className="btn btn-primary w-100"
                    onClick={placeOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;