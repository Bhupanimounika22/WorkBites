/**
 * Utility functions for handling restaurant images
 */

// Map of cuisine types to image URLs
const cuisineImages = {
  Italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Mexican: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  American: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Mediterranean: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  French: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Greek: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Spanish: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Korean: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Vietnamese: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Brazilian: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Caribbean: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

// Default image for when a cuisine doesn't have a specific image
const defaultRestaurantImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

/**
 * Get the image URL for a specific cuisine
 * @param {string} cuisine - The cuisine type
 * @returns {string} - The image URL
 */
export const getImageForCuisine = (cuisine) => {
  if (!cuisine) return defaultRestaurantImage;
  
  // Try to match the cuisine (case insensitive)
  const cuisineKey = Object.keys(cuisineImages).find(
    key => key.toLowerCase() === cuisine.toLowerCase()
  );
  
  return cuisineKey ? cuisineImages[cuisineKey] : defaultRestaurantImage;
};

/**
 * Get the image URL for a restaurant based on its primary cuisine
 * @param {Object} restaurant - The restaurant object
 * @returns {string} - The image URL
 */
export const getRestaurantImage = (restaurant) => {
  if (!restaurant || !restaurant.cuisine || restaurant.cuisine.length === 0) {
    return defaultRestaurantImage;
  }
  
  // Use the first cuisine as the primary one
  return getImageForCuisine(restaurant.cuisine[0]);
};

export default {
  getImageForCuisine,
  getRestaurantImage,
  defaultRestaurantImage,
  cuisineImages
};