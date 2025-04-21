import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axiosConfig';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get tab from URL query parameter or default to 'upcoming'
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'upcoming');
  
  const [notifications, setNotifications] = useState([]);
  const previousOrdersRef = useRef([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders');
        const newOrders = res.data.data;
        setOrders(newOrders);
        
        // Check for newly completed orders
        if (previousOrdersRef.current.length > 0) {
          const prevOrdersMap = new Map(
            previousOrdersRef.current.map(order => [order._id, order])
          );
          
          newOrders.forEach(order => {
            const prevOrder = prevOrdersMap.get(order._id);
            if (prevOrder && prevOrder.status !== 'completed' && order.status === 'completed') {
              // This order was just marked as completed
              setNotifications(prev => [
                ...prev, 
                {
                  id: Date.now(),
                  message: `Your order #${order._id.substring(0, 8)} from ${order.restaurant.name} is now complete and ready for pickup at ${formatDate(order.pickupTime)}!`,
                  orderId: order._id
                }
              ]);
              
              // Show toast notification
              toast.success(
                <div>
                  <strong>Your order is ready for pickup!</strong>
                  <p className="mb-0 mt-1">
                    {order.restaurant.name} has completed your order and it's ready for pickup.
                  </p>
                </div>,
                { autoClose: 8000 }
              );
            }
          });
        }
        
        // Update the previous orders reference
        previousOrdersRef.current = newOrders;
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up polling to check for order updates every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    const pickupTime = new Date(order.pickupTime);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return (pickupTime > now || order.status === 'pending' || order.status === 'confirmed' || 
              order.status === 'preparing' || order.status === 'ready') && 
              order.status !== 'cancelled' && order.status !== 'completed';
    } else if (activeTab === 'past') {
      return order.status === 'completed' || order.status === 'cancelled' || pickupTime < now;
    } else if (activeTab === 'scheduled') {
      // Orders scheduled for more than 2 hours in the future
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      return pickupTime > twoHoursFromNow && 
             order.status !== 'cancelled' && 
             order.status !== 'completed';
    }
    return true;
  });

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/${orderId}`);
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-info';
      case 'preparing':
        return 'bg-primary';
      case 'ready':
        return 'bg-success';
      case 'completed':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Remove a notification
  const dismissNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1>My Orders</h1>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome, {user?.name}</h5>
              <p className="card-text">
                <small className="text-muted">{user?.email}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            {notifications.map(notification => (
              <div key={notification.id} className="alert alert-success alert-dismissible fade show" role="alert">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <div>
                    <h5 className="alert-heading mb-1">Order Ready for Pickup!</h5>
                    <p className="mb-0">{notification.message}</p>
                    <button 
                      className="btn btn-sm btn-outline-success mt-2"
                      onClick={() => {
                        const order = orders.find(o => o._id === notification.orderId);
                        if (order) {
                          const element = document.getElementById(`order-${order._id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            element.classList.add('highlight-order');
                            setTimeout(() => {
                              element.classList.remove('highlight-order');
                            }, 3000);
                          }
                        }
                        dismissNotification(notification.id);
                      }}
                    >
                      <i className="bi bi-eye me-1"></i> View Order Details
                    </button>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => dismissNotification(notification.id)}
                  aria-label="Close"
                ></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('upcoming');
              navigate('/user-dashboard?tab=upcoming');
            }}
          >
            <i className="bi bi-clock me-1"></i> Upcoming Orders
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('scheduled');
              navigate('/user-dashboard?tab=scheduled');
            }}
          >
            <i className="bi bi-calendar-check me-1"></i> Scheduled Orders
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('past');
              navigate('/user-dashboard?tab=past');
            }}
          >
            <i className="bi bi-archive me-1"></i> Past Orders
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div className="card mb-4" key={order._id} id={`order-${order._id}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Order #{order._id.substring(0, 8)}</h5>
                    <small className="text-muted">
                      Placed on {formatDate(order.createdAt)}
                    </small>
                  </div>
                  <div>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    
                    {/* Add scheduled badge if pickup time is more than 2 hours in the future */}
                    {(() => {
                      const pickupTime = new Date(order.pickupTime);
                      const now = new Date();
                      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                      
                      if (pickupTime > twoHoursFromNow) {
                        return (
                          <span className="badge bg-info ms-1">
                            <i className="bi bi-calendar-check me-1"></i>
                            Scheduled
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Order Details</h6>
                      <div className="table-responsive">
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
                              <th colSpan="2" className="text-end">Total:</th>
                              <th>${order.totalAmount.toFixed(2)}</th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <h6>Restaurant</h6>
                      <p className="mb-1">{order.restaurant.name}</p>
                      <p className="mb-3 small">
                        {order.restaurant.address?.street}, {order.restaurant.address?.city}
                      </p>
                      
                      <h6>Pickup Time</h6>
                      <p className="mb-3">{formatDate(order.pickupTime)}</p>
                      
                      <h6>Payment</h6>
                      <p className="mb-1">
                        Method: {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="mb-3">
                        Status: <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </p>
                      
                      {order.specialInstructions && (
                        <>
                          <h6>Special Instructions</h6>
                          <p className="mb-3 small">{order.specialInstructions}</p>
                        </>
                      )}
                      
                      {activeTab === 'upcoming' && order.status !== 'ready' && order.status !== 'completed' && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelOrder(order._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center my-5">
              {activeTab === 'upcoming' ? (
                <>
                  <i className="bi bi-bag-x fs-1 text-muted mb-3"></i>
                  <h3>No Upcoming Orders</h3>
                  <p className="text-muted">
                    You don't have any upcoming orders. Browse restaurants to place an order.
                  </p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-shop me-1"></i> Browse Restaurants
                  </button>
                </>
              ) : activeTab === 'scheduled' ? (
                <>
                  <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
                  <h3>No Scheduled Orders</h3>
                  <p className="text-muted">
                    You don't have any orders scheduled for future pickup.
                  </p>
                  <p className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Schedule an order by selecting a pickup time more than 2 hours in the future.
                  </p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-calendar-plus me-1"></i> Schedule an Order
                  </button>
                </>
              ) : (
                <>
                  <i className="bi bi-archive fs-1 text-muted mb-3"></i>
                  <h3>No Past Orders</h3>
                  <p className="text-muted">
                    You don't have any past orders yet.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;