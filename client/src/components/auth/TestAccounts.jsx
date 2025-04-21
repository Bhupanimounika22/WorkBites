import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { directLogin } from '../../utils/directAuth';

const TestAccounts = () => {
  // Start with the panel open by default to help users
  const [isOpen, setIsOpen] = useState(true);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Auto-open the panel when the component mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const toggleAccounts = () => {
    setIsOpen(!isOpen);
  };
  
  // Function to auto-fill login form
  const fillLoginForm = (email) => {
    // Find the email and password inputs
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    // Fill the form
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = 'password123';
    
    // Focus on the submit button if it exists
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) submitButton.focus();
  };
  
  // Function to directly log in with a test account
  const loginWithTestAccount = async (email) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Show loading toast
      const loadingToastId = toast.info(
        <div>
          <strong>Logging in as {email}...</strong>
          <div className="mt-2">
            <div className="spinner-border spinner-border-sm text-light me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Please wait</span>
          </div>
        </div>,
        { autoClose: false }
      );
      
      // Determine user role based on email
      let userRole = 'user';
      if (email.includes('admin')) {
        userRole = 'admin';
      } else if (email.includes('restaurant') || email.includes('marco@italianodelizioso.com')) {
        userRole = 'restaurant';
      }
      
      // Short delay to show the loading toast
      setTimeout(() => {
        try {
          // Dismiss loading toast
          toast.dismiss(loadingToastId);
          
          // Show success toast
          toast.success(`Logged in successfully as ${email.split('@')[0]}`);
          
          // Use direct login utility
          directLogin(email, userRole);
        } catch (err) {
          toast.error(`Login failed: ${err.message || 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      toast.error(`Login failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4 border-primary border-top border-4 shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 d-flex align-items-center">
          <i className="bi bi-person-badge me-2"></i>
          Test Accounts - Login Instantly
        </h5>
        <button 
          className="btn btn-sm btn-light rounded-pill px-3" 
          onClick={toggleAccounts}
        >
          {isOpen ? 'Hide Accounts' : 'Show Accounts'}
        </button>
      </div>
      
      {isOpen && (
        <div className="card-body">
          <p className="card-text mb-4">
            You can use these test accounts to explore different roles in the application:
          </p>
          
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-lock fs-4 me-2"></i>
                    <h6 className="mb-0">Admin User</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="text-muted small">Email:</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-light" 
                        value="admin@foodpreorder.com" 
                        readOnly
                      />
                      <div className="input-group-text">
                        <button 
                          className="btn btn-sm btn-outline-secondary me-1" 
                          onClick={() => navigator.clipboard.writeText('admin@foodpreorder.com')}
                          title="Copy to clipboard"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => loginWithTestAccount('admin@foodpreorder.com')}
                          title="Login instantly"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Logging in...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-arrow-in-right"></i> Login
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted small">Password:</label>
                    <p className="mb-0"><code>any password will work</code></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-success text-white">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person fs-4 me-2"></i>
                    <h6 className="mb-0">Regular User</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="text-muted small">Email:</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-light" 
                        value="user@example.com" 
                        readOnly
                      />
                      <div className="input-group-text">
                        <button 
                          className="btn btn-sm btn-outline-secondary me-1" 
                          onClick={() => navigator.clipboard.writeText('user@example.com')}
                          title="Copy to clipboard"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => loginWithTestAccount('user@example.com')}
                          title="Login instantly"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Logging in...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-arrow-in-right"></i> Login
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted small">Password:</label>
                    <p className="mb-0"><code>any password will work</code></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shop fs-4 me-2"></i>
                    <h6 className="mb-0">Restaurant Owner</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="text-muted small">Email:</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-light" 
                        value="marco@italianodelizioso.com" 
                        readOnly
                      />
                      <div className="input-group-text">
                        <button 
                          className="btn btn-sm btn-outline-secondary me-1" 
                          onClick={() => navigator.clipboard.writeText('marco@italianodelizioso.com')}
                          title="Copy to clipboard"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-info text-white" 
                          onClick={() => loginWithTestAccount('marco@italianodelizioso.com')}
                          title="Login instantly"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Logging in...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-arrow-in-right"></i> Login
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted small">Password:</label>
                    <p className="mb-0"><code>any password will work</code></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="alert alert-success mt-3 d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div>
              <strong>Quick Login:</strong> Click the "Login" button next to any account to instantly log in without entering a password.
              <div className="mt-2">
                <small className="d-block">• One-click login with any of these test accounts</small>
                <small className="d-block">• No password required - authentication is simulated</small>
                <small className="d-block">• You'll be redirected to the dashboard after login</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAccounts;