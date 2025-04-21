import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
            <div className="mb-4">
              <Link to="/" className="d-flex align-items-center text-white text-decoration-none">
                <i className="bi bi-clock-history fs-3 me-2 text-primary"></i>
                <h4 className="mb-0 fw-bold">Food Pre-Order</h4>
              </Link>
            </div>
            <p className="mb-4">
              Order your favorite food in advance and pick it up when it's ready.
              Skip the wait and enjoy your meal at your convenience.
            </p>
            <div className="social-icons mb-4">
              <a href="#" className="me-3 fs-5">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="me-3 fs-5">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="me-3 fs-5">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="me-3 fs-5">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/">
                  <i className="bi bi-chevron-right me-1 small"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants">
                  <i className="bi bi-chevron-right me-1 small"></i> Restaurants
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login">
                  <i className="bi bi-chevron-right me-1 small"></i> Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register">
                  <i className="bi bi-chevron-right me-1 small"></i> Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5>Popular Cuisines</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/restaurants?cuisine=Italian">
                  <i className="bi bi-chevron-right me-1 small"></i> Italian
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants?cuisine=Japanese">
                  <i className="bi bi-chevron-right me-1 small"></i> Japanese
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants?cuisine=Mexican">
                  <i className="bi bi-chevron-right me-1 small"></i> Mexican
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants?cuisine=Indian">
                  <i className="bi bi-chevron-right me-1 small"></i> Indian
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/restaurants?cuisine=American">
                  <i className="bi bi-chevron-right me-1 small"></i> American
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex align-items-start">
                <i className="bi bi-geo-alt-fill me-2 mt-1"></i>
                <span>123 Food Street<br />Foodville, FD 12345</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-envelope-fill me-2"></i>
                <a href="mailto:info@foodpreorder.com">info@foodpreorder.com</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-2"></i>
                <a href="tel:+11234567890">(123) 456-7890</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-clock-fill me-2"></i>
                <span>Mon-Fri: 9AM - 10PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr />
        
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="copyright mb-0">
              &copy; {new Date().getFullYear()} Food Pre-Order. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#">Privacy Policy</a>
              </li>
              <li className="list-inline-item mx-3">
                <a href="#">Terms of Service</a>
              </li>
              <li className="list-inline-item">
                <a href="#">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;