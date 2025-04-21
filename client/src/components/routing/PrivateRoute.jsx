import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const location = useLocation();
  
  // DIRECT CHECK: Check localStorage directly for token and user
  const hasToken = !!localStorage.getItem('token');
  const hasUser = !!localStorage.getItem('user');
  const directlyAuthenticated = hasToken && hasUser;
  
  // Debug authentication state
  useEffect(() => {
    console.log('PrivateRoute - Auth State:', { 
      contextAuth: isAuthenticated, 
      directAuth: directlyAuthenticated,
      loading, 
      user,
      path: location.pathname,
      localStorage: {
        token: hasToken ? 'exists' : 'missing',
        user: hasUser ? 'exists' : 'missing'
      }
    });
  }, [isAuthenticated, directlyAuthenticated, loading, user, location, hasToken, hasUser]);

  // Show loading state
  if (loading) {
    console.log('PrivateRoute - Loading state');
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

  // IMPORTANT: Use direct localStorage check OR context authentication
  // This ensures we don't get stuck in a redirect loop if the context state is wrong
  if (!directlyAuthenticated && !isAuthenticated) {
    console.log('PrivateRoute - Not authenticated (direct check), redirecting to login');
    
    // Show a toast message explaining the redirect
    toast.info('Please log in to access this page');
    
    // Redirect to login with the current path as the redirect parameter
    return <Navigate to={`/login?redirect=${location.pathname.substring(1)}`} />;
  }

  // User is authenticated (either by context or direct check), render the protected component
  console.log('PrivateRoute - Authenticated (direct check), rendering protected content');
  return children;
};

export default PrivateRoute;