/**
 * Utility functions for handling food images
 */

// Map of food categories to image URLs
const foodCategoryImages = {
  appetizers: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  soups: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  sandwiches: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  chicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  beef: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  pork: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  lamb: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  vegetarian: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  desserts: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  sides: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a9b969df67a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  lunch: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  dinner: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  specials: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  main: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

// Default image for when a food category doesn't have a specific image
const defaultFoodImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

/**
 * Get the image URL for a specific food category
 * @param {string} category - The food category
 * @returns {string} - The image URL
 */
export const getImageForFoodCategory = (category) => {
  if (!category) return defaultFoodImage;
  
  // Try to match the category (case insensitive)
  const normalizedCategory = category.toLowerCase();
  
  for (const [key, value] of Object.entries(foodCategoryImages)) {
    if (key.toLowerCase() === normalizedCategory) {
      return value;
    }
  }
  
  return defaultFoodImage;
};

/**
 * Get the image URL for a menu item based on its category
 * @param {Object} menuItem - The menu item object
 * @returns {string} - The image URL
 */
export const getMenuItemImage = (menuItem) => {
  if (!menuItem || !menuItem.category) {
    return defaultFoodImage;
  }
  
  return getImageForFoodCategory(menuItem.category);
};

export default {
  getImageForFoodCategory,
  getMenuItemImage,
  defaultFoodImage,
  foodCategoryImages
};