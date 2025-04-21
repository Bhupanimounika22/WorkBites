import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const RestaurantRoute = ({ children }) => {
  const { isAuthenticated: contextIsAuthenticated, loading, user: contextUser } = useContext(AuthContext);
  const location = useLocation();
  const isDirectlyAuthenticated = directIsAuthenticated();
  const directUser = directGetCurrentUser();
  const userRole = directUser?.role || contextUser?.role;
  useEffect(() => {
    console.log('RestaurantRoute - Auth State:', { 
      contextAuth: contextIsAuthenticated, 
      directAuth: isDirectlyAuthenticated,
      contextUser,
      directUser,
      userRole,
      path: location.pathname,
      globalFlag: !!window.__isAuthenticated
    });
    
    // If we have authentication in localStorage but not in context, set the global flag
    if (!contextIsAuthenticated && isDirectlyAuthenticated) {
      console.log('RestaurantRoute - Setting global authentication flag');
      window.__isAuthenticated = true;
    }
  }, [contextIsAuthenticated, isDirectlyAuthenticated, contextUser, directUser, userRole, location]);

  // Show loading state
  if (loading && !isDirectlyAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated AND has restaurant role
  const isRestaurantOrAdmin = userRole === 'restaurant' || userRole === 'admin';
  
  if (!isDirectlyAuthenticated || !isRestaurantOrAdmin) {
    console.log('RestaurantRoute - Not authorized, redirecting to home');
    
    // Show a toast message explaining the redirect
    toast.info('You need restaurant owner access for this page');
    
    // Redirect to home
    return <Navigate to="/" />;
  }

  // User is authenticated and has restaurant role, render the protected component
  console.log('RestaurantRoute - Authorized, rendering restaurant content');
  return children;
};

export default RestaurantRoute;