import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TestAccounts from '../components/auth/TestAccounts';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect parameter from URL
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect');

  const { name, email, password, confirmPassword, phone, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!name || name.trim() === '') {
      toast.error('Please enter your name');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Show a loading toast
      const loadingToastId = toast.info(
        <div>
          <strong>Creating your account...</strong>
          <div className="mt-2">
            <div className="spinner-border spinner-border-sm text-light me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Please wait</span>
          </div>
        </div>,
        { autoClose: false }
      );
      
      const userData = {
        name,
        email,
        password,
        phone,
        role
      };
      
      console.log('Registering user with data:', userData);
      
      // Register the user
      const result = await register(userData);
      console.log('Registration successful:', result);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show success toast
      toast.success(
        <div>
          <strong>Registration successful!</strong>
          <p className="mb-0 mt-1">Your account has been created and you are now logged in.</p>
        </div>
      );
      
      // Verify authentication state before redirecting
      console.log('Register - Checking auth state before redirect:', { 
        isAuthenticated: true,
        user: result.user.email,
        localStorage: {
          token: localStorage.getItem('token') ? 'exists' : 'missing',
          user: localStorage.getItem('user') ? 'exists' : 'missing'
        }
      });
      
      // Handle redirect after registration
      if (redirectTo === 'checkout') {
        // If coming from checkout, redirect back to checkout
        console.log('Register - Redirecting to checkout');
        navigate('/checkout');
      } else {
        // Default redirect to user dashboard
        console.log('Register - Redirecting to user dashboard');
        navigate('/user-dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="row justify-content-center" style={{ minHeight: "80vh", paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="col-lg-6 col-md-8">
          <div className="auth-form">
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-block mb-3">
                <i className="bi bi-clock-history text-primary fs-1"></i>
              </Link>
              <h2 className="auth-form-title">Create an Account</h2>
              <p className="text-muted">Join Food Pre-Order to start ordering your favorite meals</p>
              
              <div className="d-flex justify-content-center mt-3">
                <button 
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    // Set form data with sample values
                    setFormData({
                      name: 'Test User',
                      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
                      password: 'password123',
                      confirmPassword: 'password123',
                      phone: '(555) 123-4567',
                      role: 'user'
                    });
                    
                    // Submit the form after a short delay
                    setTimeout(() => {
                      onSubmit({ preventDefault: () => {} });
                    }, 100);
                  }}
                >
                  <i className="bi bi-lightning-fill me-1"></i> Quick Register
                </button>
              </div>
            </div>
            
            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
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
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={onChange}
                      minLength="6"
                      required
                    />
                  </div>
                  <small className="text-muted">Password must be at least 6 characters</small>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={onChange}
                      minLength="6"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-12 mb-4">
                  <label htmlFor="role" className="form-label">
                    I am registering as
                  </label>
                  <div className="d-flex">
                    <div className="form-check me-4">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleUser"
                        value="user"
                        checked={role === 'user'}
                        onChange={onChange}
                      />
                      <label className="form-check-label" htmlFor="roleUser">
                        Customer
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleRestaurant"
                        value="restaurant"
                        checked={role === 'restaurant'}
                        onChange={onChange}
                      />
                      <label className="form-check-label" htmlFor="roleRestaurant">
                        Restaurant Owner
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="termsCheck" required />
                <label className="form-check-label" htmlFor="termsCheck">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
            
            <div className="text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/login" className="fw-medium">
                  Sign In
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

export default Register;