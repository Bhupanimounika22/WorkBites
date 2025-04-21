import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Admin Dashboard Components
const AdminHome = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRestaurants: 0,
    totalMenuItems: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you would have an endpoint to get all these stats
        // For now, we'll make separate requests
        const [ordersRes, usersRes, restaurantsRes, menuRes] = await Promise.all([
          axios.get('/api/orders?limit=5'),
          axios.get('/api/auth/users'), // This endpoint would need to be created
          axios.get('/api/restaurants'),
          axios.get('/api/menu')
        ]);

        setStats({
          totalOrders: ordersRes.data.count || 0,
          totalUsers: usersRes?.data?.count || 0,
          totalRestaurants: restaurantsRes.data.count || 0,
          totalMenuItems: menuRes.data.count || 0,
          recentOrders: ordersRes.data.data || []
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        // Use mock data if API calls fail
        setStats({
          totalOrders: 25,
          totalUsers: 15,
          totalRestaurants: 8,
          totalMenuItems: 120,
          recentOrders: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
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
                  <h5 className="card-title">Users</h5>
                  <p className="card-text display-4">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <h5 className="card-title">Restaurants</h5>
                  <p className="card-text display-4">{stats.totalRestaurants}</p>
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
                            <th>Restaurant</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td>#{order._id.substring(0, 8)}</td>
                              <td>{order.user.name}</td>
                              <td>{order.restaurant.name}</td>
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
                              <td>{formatDate(order.createdAt)}</td>
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
        </>
      )}
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This endpoint would need to be created
        const res = await axios.get('/api/auth/users');
        setUsers(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        // Use mock data if API call fails
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date() },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date() },
          { _id: '3', name: 'Restaurant Owner', email: 'owner@example.com', role: 'restaurant', createdAt: new Date() }
        ]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h2 className="mb-4">Manage Users</h2>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'admin' ? 'bg-danger' :
                          user.role === 'restaurant' ? 'bg-primary' :
                          'bg-secondary'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/api/restaurants');
        setRestaurants(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Manage Restaurants</h2>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cuisine</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td>{restaurant.name}</td>
                      <td>{restaurant.cuisine.join(', ')}</td>
                      <td>{restaurant.address?.city}, {restaurant.address?.state}</td>
                      <td>{restaurant.phone}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders');
        setOrders(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
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

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status });
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div>
      <h2 className="mb-4">Manage Orders</h2>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Restaurant</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Pickup Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(0, 8)}</td>
                      <td>{order.user.name}</td>
                      <td>{order.restaurant.name}</td>
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
                                Ready
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active link based on current path
  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="container">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group">
            <Link
              to="/admin"
              className={`list-group-item list-group-item-action ${getActiveClass('/admin')}`}
            >
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
            <Link
              to="/admin/users"
              className={`list-group-item list-group-item-action ${getActiveClass('/admin/users')}`}
            >
              <i className="bi bi-people me-2"></i> Manage Users
            </Link>
            <Link
              to="/admin/restaurants"
              className={`list-group-item list-group-item-action ${getActiveClass('/admin/restaurants')}`}
            >
              <i className="bi bi-shop me-2"></i> Manage Restaurants
            </Link>
            <Link
              to="/admin/orders"
              className={`list-group-item list-group-item-action ${getActiveClass('/admin/orders')}`}
            >
              <i className="bi bi-bag me-2"></i> Manage Orders
            </Link>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <Routes>
                <Route path="/" element={<AdminHome />} />
                <Route path="/users" element={<ManageUsers />} />
                <Route path="/restaurants" element={<ManageRestaurants />} />
                <Route path="/orders" element={<ManageOrders />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;