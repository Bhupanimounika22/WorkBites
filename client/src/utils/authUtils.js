/**
 * Utility functions for authentication
 */

/**
 * Ensures the user is properly authenticated by directly setting localStorage
 * and returning a promise that resolves when the data is set
 * 
 * @param {Object} userData - The user data to store
 * @param {string} token - The authentication token
 * @returns {Promise} A promise that resolves when the data is set
 */
export const ensureAuthenticated = (userData, token) => {
  console.log('AuthUtils - Ensuring authentication with:', {
    user: userData?.email,
    hasToken: !!token
  });
  
  return new Promise((resolve) => {
    // Set the data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Verify the data was set correctly
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthUtils - Verified localStorage:', {
      tokenSet: storedToken === token,
      userSet: !!storedUser
    });
    
    // Small delay to ensure the data is properly set
    setTimeout(() => {
      resolve({
        success: true,
        user: userData,
        token
      });
    }, 100);
  });
};

/**
 * Checks if the user is authenticated by directly checking localStorage
 * 
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return !!token && !!user;
};

/**
 * Gets the current user from localStorage
 * 
 * @returns {Object|null} The user object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
};

/**
 * Gets the user role from localStorage
 * 
 * @returns {string|null} The user role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};