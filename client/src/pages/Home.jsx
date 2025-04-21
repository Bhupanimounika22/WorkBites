import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import staticRestaurants from '../data/restaurants';
import { getRestaurantImage } from '../utils/imageUtils';

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use static data instead of API call
    const fetchFeaturedRestaurants = () => {
      try {
        // Get first 3 restaurants from static data
        const featured = staticRestaurants.slice(0, 3);
        setFeaturedRestaurants(featured);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchFeaturedRestaurants();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">Pre-Order Your Favorite Food</h1>
                <p className="hero-subtitle">
                  Skip the wait! Order ahead and pick up your food when it's ready.
                </p>
                <Link to="/restaurants" className="btn btn-primary btn-lg">
                  Find Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mb-5">
        <h2 className="text-center mb-4 fw-bold">How It Works</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <i className="bi bi-search fs-1 text-primary mb-3"></i>
                <h3>Find</h3>
                <p className="card-text">
                  Browse restaurants and menus to find your favorite food.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <i className="bi bi-clock fs-1 text-primary mb-3"></i>
                <h3>Order</h3>
                <p className="card-text">
                  Place your order and select your preferred pickup time.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <i className="bi bi-bag-check fs-1 text-primary mb-3"></i>
                <h3>Pickup</h3>
                <p className="card-text">
                  Skip the line and pick up your food when it's ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Restaurants Section */}
      <div className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Featured Restaurants</h2>
          <Link to="/restaurants" className="btn btn-outline-primary">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row">
            {featuredRestaurants.length > 0 ? (
              featuredRestaurants.map((restaurant) => (
                <div className="col-md-4 mb-4" key={restaurant._id}>
                  <div className="card restaurant-card">
                    <img
                      src={getRestaurantImage(restaurant)}
                      className="card-img-top"
                      alt={restaurant.name}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <div className="mb-2">
                        {restaurant.cuisine.map((cuisine, index) => (
                          <span key={index} className="cuisine-badge">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                      <p className="card-text">
                        {restaurant.description?.substring(0, 80)}
                        {restaurant.description?.length > 80 ? '...' : ''}
                      </p>
                      <div className="location-info">
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>{restaurant.address?.city}</span>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <Link
                        to={`/restaurants/${restaurant._id}`}
                        className="btn btn-primary w-100"
                      >
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-center">No restaurants found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="bg-light p-5 rounded mb-5">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold">What Our Customers Say</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <p className="quote">
                    "This app has saved me so much time! I can order my lunch in
                    advance and pick it up without waiting in line."
                  </p>
                  <p className="author">- Sarah J.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-half"></i>
                  </div>
                  <p className="quote">
                    "I love being able to schedule my pickup time. It makes my
                    lunch break so much more efficient."
                  </p>
                  <p className="author">- Michael T.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <p className="quote">
                    "The food is always ready on time, and the pickup process is
                    seamless. Highly recommend!"
                  </p>
                  <p className="author">- Emily R.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* App Download Section */}
      <div className="container mb-5">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <h2 className="fw-bold">Download Our Mobile App</h2>
            <p className="lead mb-4">
              Get the full experience on your mobile device. Order food, track your orders,
              and receive notifications when your food is ready.
            </p>
            <div className="d-flex flex-wrap">
              <a href="#" className="me-3 mb-3">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" 
                  alt="Get it on Google Play" 
                  height="50"
                />
              </a>
              <a href="#">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" 
                  alt="Download on the App Store" 
                  height="50"
                />
              </a>
            </div>
          </div>
          <div className="col-md-6">
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="Mobile App" 
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;