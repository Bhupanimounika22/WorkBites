import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const authLinks = (
    <>
      <li className="nav-item dropdown">
        <a
          className="nav-link dropdown-toggle"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {user && user.name}
        </a>
        <ul className="dropdown-menu">
          {user && user.role === 'admin' && (
            <li>
              <Link className="dropdown-item" to="/admin">
                Admin Dashboard
              </Link>
            </li>
          )}
          {user && user.role === 'restaurant' && (
            <li>
              <Link className="dropdown-item" to="/restaurant-dashboard">
                Restaurant Dashboard
              </Link>
            </li>
          )}
          <li>
            <Link className="dropdown-item" to="/dashboard">
              My Orders
            </Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          Login
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">
          Register
        </Link>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-clock-history text-primary me-2"></i>
          <span className="fw-bold">Food Pre-Order</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/restaurants">
                <i className="bi bi-shop me-1"></i> Restaurants
              </Link>
            </li>
            {isAuthenticated && user?.role === 'user' && (
              <li className="nav-item">
                <Link className="nav-link px-3" to="/user-dashboard">
                  <i className="bi bi-person me-1"></i> My Orders
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'restaurant' && (
              <li className="nav-item">
                <Link className="nav-link px-3" to="/restaurant-dashboard">
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link px-3" to="/admin">
                  <i className="bi bi-gear me-1"></i> Admin
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item me-2">
              <Link className="nav-link position-relative" to="/cart">
                <i className="bi bi-cart3 fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                  <span className="visually-hidden">items in cart</span>
                </span>
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  {user?.role === 'restaurant' && (
                    <li>
                      <Link className="dropdown-item" to="/restaurant-dashboard">
                        <i className="bi bi-shop me-2"></i> Restaurant Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/user-dashboard">
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/user-dashboard">
                      <i className="bi bi-bag me-2"></i> My Orders
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex">
                <Link className="nav-link px-3" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
                <Link className="btn btn-primary btn-sm my-1" to="/register">
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;