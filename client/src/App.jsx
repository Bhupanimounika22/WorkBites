import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authInit from './utils/authInit';

// Components
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import OrderSuccess from './pages/OrderSuccess';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantDetail from './pages/RestaurantDetail';
import RestaurantList from './pages/RestaurantList';
import UserDashboard from './pages/UserDashboard';

// Private Route
import AdminRoute from './components/routing/AdminRoute';
import PrivateRoute from './components/routing/PrivateRoute';
import RestaurantRoute from './components/routing/RestaurantRoute';

const App = () => {
  // Initialize authentication state when the app loads
  useEffect(() => {
    console.log('App - Authentication initialized:', authInit);
    
    // Set up a listener for storage events to handle authentication changes
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('App - Storage changed:', e.key);
        // Update the global flag
        window.__isAuthenticated = !!localStorage.getItem('token') && !!localStorage.getItem('user');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* Restaurant Routes */}
          <Route path="/restaurant-dashboard/*" element={<RestaurantRoute><RestaurantDashboard /></RestaurantRoute>} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer 
        position="bottom-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;