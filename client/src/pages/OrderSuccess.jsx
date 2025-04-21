import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const OrderSuccess = () => {
  const [lastOrderIds, setLastOrderIds] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [pickupTimes, setPickupTimes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the order IDs and pickup times from localStorage
    const storedOrderIds = localStorage.getItem('lastOrderIds');
    const storedPickupTimes = localStorage.getItem('lastPickupTimes');
    
    if (storedPickupTimes) {
      try {
        const parsedPickupTimes = JSON.parse(storedPickupTimes);
        setPickupTimes(parsedPickupTimes);
      } catch (err) {
        console.error('Error parsing pickup times:', err);
      }
    }
    
    if (storedOrderIds) {
      try {
        const parsedIds = JSON.parse(storedOrderIds);
        setLastOrderIds(parsedIds);
        
        // Fetch order details for each ID
        const fetchOrderDetails = async () => {
          try {
            const orderPromises = parsedIds.map(id => 
              axios.get(`/api/orders/${id}`)
                .then(res => res.data.data)
                .catch(err => {
                  console.error(`Error fetching order ${id}:`, err);
                  return null;
                })
            );
            
            const orders = await Promise.all(orderPromises);
            setOrderDetails(orders.filter(order => order !== null));
          } catch (err) {
            console.error('Error fetching order details:', err);
          } finally {
            setLoading(false);
          }
        };
        
        fetchOrderDetails();
      } catch (err) {
        console.error('Error parsing order IDs:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card my-5">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
              </div>
              <h1 className="mb-4">Order Placed Successfully!</h1>
              <p className="lead mb-4">
                Thank you for your order. We've received your order and will begin preparing it for your selected pickup time.
              </p>
              
              {loading ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : orderDetails.length > 0 ? (
                <div className="text-start mb-4">
                  <h5 className="mb-3">Order Summary:</h5>
                  {orderDetails.map((order, index) => (
                    <div key={order._id} className="card mb-3 border-success">
                      <div className="card-header bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">Order #{order._id.substring(0, 8)}</span>
                          <span className="badge bg-warning">Pending</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p className="mb-1"><strong>Restaurant:</strong> {order.restaurant.name}</p>
                            <p className="mb-3"><strong>Items:</strong> {order.items.length}</p>
                            
                            <h6 className="mb-2">Order Items:</h6>
                            <ul className="list-group list-group-flush mb-3">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="list-group-item px-0 py-1 border-0">
                                  {item.quantity}x {item.menuItem.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <div className="alert alert-success mb-3">
                              <h6 className="alert-heading mb-2"><i className="bi bi-clock me-2"></i>Pickup Time</h6>
                              <p className="mb-0 fw-bold">{formatDate(order.pickupTime)}</p>
                            </div>
                            
                            <div className="alert alert-info mb-0">
                              <h6 className="alert-heading mb-2"><i className="bi bi-info-circle me-2"></i>What's Next?</h6>
                              <p className="mb-0 small">
                                Your order has been sent to the restaurant. They will prepare your food and notify you when it's ready for pickup.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-4">
                  You can view your order status and details in your dashboard.
                </p>
              )}
              
              <div className="d-flex justify-content-center gap-3">
                <Link to="/user-dashboard" className="btn btn-primary">
                  View My Orders
                </Link>
                <Link to="/restaurants" className="btn btn-outline-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;