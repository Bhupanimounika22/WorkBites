import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { getCurrentUser as directGetCurrentUser, isAuthenticated as directIsAuthenticated } from '../../utils/directAuth';

const AdminRoute = ({ children }) => {
  const { isAuthenticated: contextIsAuthenticated, loading, user: contextUser } = useContext(AuthContext);
  const location = useLocation();
  
  // SUPER DIRECT CHECK: Use our enhanced authentication check
  const isDirectlyAuthenticated = directIsAuthenticated();
  const directUser = directGetCurrentUser();
  
  // Get user role from direct user or context user
  const userRole = directUser?.role || contextUser?.role;
  
  // Debug authentication state
  useEffect(() => {
    console.log('AdminRoute - Auth State:', { 
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
      console.log('AdminRoute - Setting global authentication flag');
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

  // Check if user is authenticated AND has admin role
  const isAdmin = userRole === 'admin';
  
  if (!isDirectlyAuthenticated || !isAdmin) {
    console.log('AdminRoute - Not authorized, redirecting to home');
    
    // Show a toast message explaining the redirect
    toast.info('You need administrator access for this page');
    
    // Redirect to home
    return <Navigate to="/" />;
  }

  // User is authenticated and has admin role, render the protected component
  console.log('AdminRoute - Authorized, rendering admin content');
  return children;
};

export default AdminRoute;