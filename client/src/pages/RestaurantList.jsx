import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import staticRestaurants from '../data/restaurants';
import { getImageForCuisine, getRestaurantImage } from '../utils/imageUtils';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    // Use static data instead of API call
    setRestaurants(staticRestaurants);
    
    // Extract unique cuisines for filter
    const allCuisines = staticRestaurants.flatMap(restaurant => restaurant.cuisine);
    const uniqueCuisines = [...new Set(allCuisines)];
    setCuisines(uniqueCuisines);
    
    setLoading(false);
  }, []);

  // Filter restaurants based on search term and cuisine
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCuisine = cuisineFilter === '' || restaurant.cuisine.includes(cuisineFilter);
    
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="container fade-in">
      {/* Header Section */}
      <div className="hero-section mb-5" style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${getImageForCuisine('Mediterranean')})`,
        padding: "4rem 0"
      }}>
        <div className="container">
          <div className="row">
            <div className="col-md-8 mx-auto text-center">
              <h1 className="hero-title">Discover Restaurants</h1>
              <p className="hero-subtitle">
                Find the perfect restaurant for your next meal
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="search-filter-container mb-4">
        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <label htmlFor="searchInput" className="form-label">Search Restaurants</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                id="searchInput"
                type="text"
                className="form-control"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="cuisineFilter" className="form-label">Filter by Cuisine</label>
            <select
              id="cuisineFilter"
              className="form-select"
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cuisine, index) => (
                <option key={index} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mb-4">
        <h5>
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found
          {cuisineFilter && <span> in <strong>{cuisineFilter}</strong> cuisine</span>}
          {searchTerm && <span> matching <strong>"{searchTerm}"</strong></span>}
        </h5>
      </div>
      
      {loading ? (
        <div className="loading-container my-5">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {filteredRestaurants.length > 0 ? (
            <div className="row">
              {filteredRestaurants.map((restaurant) => (
                <div className="col-lg-4 col-md-6 mb-4" key={restaurant._id}>
                  <div className="card restaurant-card h-100">
                    <div className="position-relative overflow-hidden">
                      <img
                        src={getRestaurantImage(restaurant)}
                        className="card-img-top"
                        alt={restaurant.name}
                      />
                      {restaurant.cuisine.length > 0 && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-primary">
                            {restaurant.cuisine[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <div className="mb-2">
                        {restaurant.cuisine.slice(1).map((cuisine, index) => (
                          <span key={index} className="cuisine-badge">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                      <p className="card-text">
                        {restaurant.description?.substring(0, 100)}
                        {restaurant.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="location-info">
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <Link
                        to={`/restaurants/${restaurant._id}`}
                        className="btn btn-primary w-100"
                      >
                        <i className="bi bi-menu-button-wide me-2"></i>
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info p-4 text-center">
              <i className="bi bi-search fs-1 d-block mb-3"></i>
              <h4>No restaurants found matching your criteria</h4>
              <p className="mb-0">Try adjusting your search or filter to find more restaurants.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantList;