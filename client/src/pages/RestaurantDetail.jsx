import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import staticMenuItems from '../data/menuItems';
import staticRestaurants from '../data/restaurants';
import { getMenuItemImage } from '../utils/foodImageUtils';
import { getRestaurantImage } from '../utils/imageUtils';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    // Use static data instead of API calls
    const fetchRestaurantAndMenu = () => {
      try {
        // Get restaurant details from static data
        const foundRestaurant = staticRestaurants.find(r => r._id === id);
        
        if (!foundRestaurant) {
          setError('Restaurant not found');
          setLoading(false);
          return;
        }
        
        setRestaurant(foundRestaurant);
        
        // Get menu items for this restaurant from static data
        const restaurantMenuItems = staticMenuItems.filter(item => item.restaurant === id);
        setMenuItems(restaurantMenuItems);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurant details');
        setLoading(false);
      }
    };
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Only keep items from this restaurant
        const filteredCart = parsedCart.filter(item => item.restaurantId === id);
        setCart(filteredCart);
      } catch (err) {
        console.error('Error parsing cart from localStorage', err);
      }
    }

    fetchRestaurantAndMenu();
  }, [id]);
  
  // Get unique categories for filter
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items by category
  const filteredMenuItems = categoryFilter
    ? menuItems.filter(item => item.category === categoryFilter)
    : menuItems;
  
  // Add item to cart
  const addToCart = (menuItem) => {
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.id === menuItem._id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const newItem = {
        id: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      };
      setCart([...cart, newItem]);
    }
    
    toast.success(`Added ${menuItem.name} to cart`);
  };
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Get existing cart
    const existingCart = localStorage.getItem('cart') 
      ? JSON.parse(localStorage.getItem('cart')) 
      : [];
    
    // Filter out items from this restaurant
    const otherRestaurantsItems = existingCart.filter(item => item.restaurantId !== id);
    
    // Combine with current cart
    const newCart = [...otherRestaurantsItems, ...cart];
    
    localStorage.setItem('cart', JSON.stringify(newCart));
  }, [cart, id]);
  
  // Go to cart
  const goToCart = () => {
    navigate('/cart');
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="container fade-in">
      {loading ? (
        <div className="loading-container my-5">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Restaurant Hero Section */}
          <div className="restaurant-hero mb-5" style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getRestaurantImage(restaurant)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '4rem 0',
            borderRadius: '0.5rem'
          }}>
            <div className="container">
              <div className="row">
                <div className="col-md-8 mx-auto text-center text-white">
                  <h1 className="display-4 fw-bold mb-3">{restaurant.name}</h1>
                  <div className="mb-3">
                    {restaurant.cuisine.map((cuisine, index) => (
                      <span key={index} className="badge bg-primary me-2 mb-2">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                  <div className="d-flex justify-content-center gap-4 mb-3">
                    <div>
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
                    </div>
                    <div>
                      <i className="bi bi-telephone-fill me-2"></i>
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Restaurant Details */}
          <div className="row mb-5">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h3 className="card-title mb-3">About {restaurant.name}</h3>
                  <p className="card-text">{restaurant.description}</p>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h5><i className="bi bi-geo-alt-fill text-primary me-2"></i>Location</h5>
                      <address className="mb-0">
                        {restaurant.address?.street}<br />
                        {restaurant.address?.city}, {restaurant.address?.state} {restaurant.address?.zipCode}
                      </address>
                    </div>
                    <div className="col-md-6">
                      <h5><i className="bi bi-clock-fill text-primary me-2"></i>Hours</h5>
                      <p className="mb-0">
                        Monday - Friday: 11:00 AM - 10:00 PM<br />
                        Saturday - Sunday: 10:00 AM - 11:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title mb-3">Contact Information</h3>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <div className="d-flex">
                        <div className="icon-square bg-light text-primary flex-shrink-0 me-3">
                          <i className="bi bi-telephone-fill"></i>
                        </div>
                        <div>
                          <h5 className="mb-1">Phone</h5>
                          <p className="mb-0">{restaurant.phone}</p>
                        </div>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex">
                        <div className="icon-square bg-light text-primary flex-shrink-0 me-3">
                          <i className="bi bi-envelope-fill"></i>
                        </div>
                        <div>
                          <h5 className="mb-1">Email</h5>
                          <p className="mb-0">{restaurant.email || 'info@' + restaurant.name.toLowerCase().replace(/\s+/g, '') + '.com'}</p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="d-flex">
                        <div className="icon-square bg-light text-primary flex-shrink-0 me-3">
                          <i className="bi bi-globe"></i>
                        </div>
                        <div>
                          <h5 className="mb-1">Website</h5>
                          <p className="mb-0">www.{restaurant.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Section */}
          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 fw-bold">Menu</h2>
                    <div className="d-flex align-items-center">
                      <label htmlFor="categoryFilter" className="me-2 mb-0">Filter:</label>
                      <select
                        id="categoryFilter"
                        className="form-select form-select-sm"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Category Pills */}
                  <div className="mb-4 category-pills">
                    <button 
                      className={`btn btn-sm ${categoryFilter === '' ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                      onClick={() => setCategoryFilter('')}
                    >
                      All
                    </button>
                    {categories.map((category, index) => (
                      <button 
                        key={index} 
                        className={`btn btn-sm ${categoryFilter === category ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                        onClick={() => setCategoryFilter(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {filteredMenuItems.length > 0 ? (
                    filteredMenuItems.map((menuItem) => (
                      <div className="card menu-item-card mb-3 border-0 shadow-sm" key={menuItem._id}>
                        <div className="row g-0">
                          <div className="col-md-3 position-relative">
                            <img
                              src={getMenuItemImage(menuItem)}
                              className="img-fluid rounded-start h-100 object-fit-cover"
                              alt={menuItem.name}
                            />
                            {!menuItem.isAvailable && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                                <span className="badge bg-danger px-3 py-2">Unavailable</span>
                              </div>
                            )}
                          </div>
                          <div className="col-md-9">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title mb-0">{menuItem.name}</h5>
                                <span className="price-tag">${menuItem.price.toFixed(2)}</span>
                              </div>
                              <p className="card-text text-muted mb-3">{menuItem.description}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="dietary-tags">
                                  {menuItem.isVegetarian && (
                                    <span className="badge bg-success-subtle text-success me-2">
                                      <i className="bi bi-check-circle-fill me-1"></i>Vegetarian
                                    </span>
                                  )}
                                  {menuItem.isVegan && (
                                    <span className="badge bg-success-subtle text-success me-2">
                                      <i className="bi bi-check-circle-fill me-1"></i>Vegan
                                    </span>
                                  )}
                                  {menuItem.isGlutenFree && (
                                    <span className="badge bg-info-subtle text-info me-2">
                                      <i className="bi bi-check-circle-fill me-1"></i>Gluten Free
                                    </span>
                                  )}
                                </div>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => addToCart(menuItem)}
                                  disabled={!menuItem.isAvailable}
                                >
                                  {menuItem.isAvailable ? (
                                    <>
                                      <i className="bi bi-cart-plus me-1"></i> Add to Cart
                                    </>
                                  ) : (
                                    'Not Available'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert alert-info text-center p-4">
                      <i className="bi bi-search fs-1 d-block mb-3"></i>
                      <h4>No menu items found</h4>
                      <p className="mb-0">Try selecting a different category.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Cart Summary */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                <div className="card-header bg-primary text-white border-0">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-cart3 me-2"></i> Your Order
                  </h5>
                </div>
                <div className="card-body">
                  {cart.length > 0 ? (
                    <>
                      <div className="cart-items mb-4">
                        {cart.map((item) => (
                          <div className="cart-item d-flex justify-content-between align-items-center mb-3" key={item.id}>
                            <div className="d-flex align-items-center">
                              <div className="item-quantity me-2">
                                <span className="badge bg-primary rounded-pill">{item.quantity}</span>
                              </div>
                              <div className="item-name">{item.name}</div>
                            </div>
                            <div className="item-price fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                      
                      <hr />
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Subtotal:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Tax (8%):</span>
                        <span>${(cartTotal * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <span className="fw-bold">Total:</span>
                        <span className="fw-bold fs-5">${(cartTotal * 1.08).toFixed(2)}</span>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={goToCart}
                        >
                          <i className="bi bi-cart-check me-2"></i> Review Order
                        </button>
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-clock me-2"></i> Schedule Pickup
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-cart3 fs-1 text-muted mb-3"></i>
                      <p className="mb-3">Your cart is empty</p>
                      <p className="text-muted small mb-0">
                        Add items from the menu to start your order
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDetail;