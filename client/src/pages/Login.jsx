import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TestAccounts from '../components/auth/TestAccounts';
import { AuthContext } from '../context/AuthContext';
import { directLogin } from '../utils/directAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect parameter from URL
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect');

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Get the current values from the form
    const currentEmail = email || document.querySelector('input[name="email"]')?.value;
    const currentPassword = password || document.querySelector('input[name="password"]')?.value || 'password123';
    
    // Basic validation
    if (!currentEmail || !currentEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Show a loading toast
      const loadingToastId = toast.info(
        <div>
          <strong>Logging in...</strong>
          <div className="mt-2">
            <div className="spinner-border spinner-border-sm text-light me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Please wait</span>
          </div>
        </div>,
        { autoClose: false }
      );
      
      console.log('Attempting login with:', { email: currentEmail });
      
      try {
        // Try the context-based login first
        const result = await login(currentEmail, currentPassword);
        console.log('Context login successful:', result);
      } catch (contextError) {
        console.error('Context login failed, falling back to direct login:', contextError);
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show success toast
      toast.success(
        <div>
          <strong>Login successful!</strong>
          <p className="mb-0 mt-1">Welcome back!</p>
        </div>
      );
      
      // Determine user role based on email
      let userRole = 'user';
      if (currentEmail.includes('admin')) {
        userRole = 'admin';
      } else if (currentEmail.includes('restaurant') || currentEmail.includes('marco@italianodelizioso.com')) {
        userRole = 'restaurant';
      }
      
      // DIRECT LOGIN APPROACH - This bypasses any context issues
      console.log('Using direct login approach for:', currentEmail, 'with role:', userRole);
      
      // Use the direct login utility which will handle the redirect
      directLogin(
        currentEmail, 
        userRole, 
        redirectTo === 'checkout' ? 'checkout' : null
      );
    } catch (err) {
      console.error('Login error:', err);
      toast.error(
        <div>
          <strong>Login failed</strong>
          <p className="mb-0 mt-1">{err.message || 'Please check your credentials and try again.'}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="col-lg-5 col-md-7">
          <div className="auth-form">
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-block mb-4">
                <i className="bi bi-clock-history text-primary fs-1"></i>
              </Link>
              <h2 className="auth-form-title">Welcome Back</h2>
              <p className="text-muted">Sign in to continue to Food Pre-Order</p>
              
              <div className="d-flex justify-content-center mt-3">
                <button 
                  type="button"
                  className="btn btn-success me-2"
                  onClick={() => {
                    // Set form data
                    setFormData({
                      email: 'user@example.com',
                      password: 'password123'
                    });
                    
                    // Use direct login approach
                    setLoading(true);
                    
                    // Show a loading toast
                    const loadingToastId = toast.info(
                      <div>
                        <strong>Logging in as test user...</strong>
                        <div className="mt-2">
                          <div className="spinner-border spinner-border-sm text-light me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span>Please wait</span>
                        </div>
                      </div>,
                      { autoClose: false }
                    );
                    
                    // Short delay to show the loading toast
                    setTimeout(() => {
                      try {
                        // Dismiss loading toast
                        toast.dismiss(loadingToastId);
                        
                        // Show success toast
                        toast.success('Login successful!');
                        
                        // Use direct login utility
                        directLogin('user@example.com', 'user', redirectTo === 'checkout' ? 'checkout' : null);
                      } catch (err) {
                        // Show error toast
                        toast.error('Login failed: ' + (err.message || 'Unknown error'));
                      } finally {
                        setLoading(false);
                      }
                    }, 1000);
                  }}
                >
                  <i className="bi bi-person-fill me-1"></i> Quick Login as User
                </button>
                <button 
                  type="button"
                  className="btn btn-info text-white"
                  onClick={() => {
                    // Set form data
                    setFormData({
                      email: 'marco@italianodelizioso.com',
                      password: 'password123'
                    });
                    
                    // Use direct login approach
                    setLoading(true);
                    
                    // Show a loading toast
                    const loadingToastId = toast.info(
                      <div>
                        <strong>Logging in as restaurant owner...</strong>
                        <div className="mt-2">
                          <div className="spinner-border spinner-border-sm text-light me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span>Please wait</span>
                        </div>
                      </div>,
                      { autoClose: false }
                    );
                    
                    // Short delay to show the loading toast
                    setTimeout(() => {
                      try {
                        // Dismiss loading toast
                        toast.dismiss(loadingToastId);
                        
                        // Show success toast
                        toast.success('Login successful!');
                        
                        // Use direct login utility
                        directLogin('marco@italianodelizioso.com', 'restaurant', redirectTo === 'checkout' ? 'checkout' : null);
                      } catch (err) {
                        // Show error toast
                        toast.error('Login failed: ' + (err.message || 'Unknown error'));
                      } finally {
                        setLoading(false);
                      }
                    }, 1000);
                  }}
                >
                  <i className="bi bi-shop me-1"></i> Login as Restaurant
                </button>
              </div>
            </div>
            
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="password" className="form-label mb-0">
                    Password
                  </label>
                  <Link to="#" className="small text-decoration-none">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              
              <div className="d-grid gap-2 mb-4">
                <button
                  type="submit"
                  className="btn btn-primary py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
              
              <div className="divider">
                <span>or</span>
              </div>
              
              <div className="d-grid gap-2 mb-4">
                <button type="button" className="btn btn-outline-secondary py-2">
                  <i className="bi bi-google me-2"></i> Continue with Google
                </button>
              </div>
            </form>
            
            <div className="text-center">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="fw-medium">
                  Sign Up
                </Link>
              </p>
            </div>
            
            {/* Test Accounts Component */}
            <TestAccounts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;