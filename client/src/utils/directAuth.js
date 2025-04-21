/**
 * Direct authentication utilities that bypass the context
 * This is a fallback mechanism for when the context-based authentication fails
 */

/**
 * Directly log in a user by setting localStorage and redirecting
 * 
 * @param {string} email - User email
 * @param {string} role - User role (user, restaurant, admin)
 * @param {string} redirectTo - Where to redirect after login
 */
export const directLogin = (email, role = 'user', redirectTo = null) => {
  console.log('DirectAuth - Performing direct login for:', email);
  
  // Create a user object with all required fields
  const user = {
    id: 'user_' + Date.now(),
    name: email.split('@')[0],
    email: email,
    role: role,
    phone: '(555) 000-0000',
    isAuthenticated: true
  };
  
  // Create a simple token with all required fields
  const token = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    iat: Date.now()
  }));
  
  // CRITICAL: Set a global flag to prevent redirect loops
  window.__isAuthenticated = true;
  
  // Set localStorage directly with multiple approaches to ensure it sticks
  try {
    // Clear existing items first
    localStorage.clear();
    
    // Standard approach
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also set sessionStorage as a backup
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Set a cookie as another backup
    document.cookie = `auth_token=${token}; path=/; max-age=${60*60*24*7}`; // 7 days
    document.cookie = `auth_user=${JSON.stringify(user)}; path=/; max-age=${60*60*24*7}`; // 7 days
    
    // Verify the data was set correctly
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('DirectAuth - Authentication data verification:', {
      tokenSet: !!storedToken,
      userSet: !!storedUser,
      tokenMatch: storedToken === token,
      userMatch: storedUser === JSON.stringify(user)
    });
  } catch (e) {
    console.error('Error setting authentication data:', e);
  }
  
  // Determine redirect URL
  let redirectUrl = '/user-dashboard';
  
  if (redirectTo) {
    redirectUrl = '/' + redirectTo;
  } else if (role === 'restaurant') {
    redirectUrl = '/restaurant-dashboard';
  } else if (role === 'admin') {
    redirectUrl = '/admin';
  }
  
  console.log('DirectAuth - Redirecting to:', redirectUrl);
  
  // Create a form to post the authentication data
  // This is a more reliable way to pass data between pages
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = redirectUrl;
  form.style.display = 'none';
  
  // Add the token as a hidden field
  const tokenField = document.createElement('input');
  tokenField.type = 'hidden';
  tokenField.name = 'token';
  tokenField.value = token;
  form.appendChild(tokenField);
  
  // Add the user as a hidden field
  const userField = document.createElement('input');
  userField.type = 'hidden';
  userField.name = 'user';
  userField.value = JSON.stringify(user);
  form.appendChild(userField);
  
  // Add the form to the document and submit it
  document.body.appendChild(form);
  
  // Set a timeout to ensure the localStorage has time to update
  setTimeout(() => {
    // Force a page reload to the dashboard
    window.location.href = redirectUrl;
  }, 500);
};

/**
 * Check if a user is authenticated by checking all storage methods
 * 
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  // Check global flag first (most reliable during the current session)
  if (window.__isAuthenticated) {
    return true;
  }
  
  // Check localStorage
  const hasLocalToken = !!localStorage.getItem('token');
  const hasLocalUser = !!localStorage.getItem('user');
  
  // Check sessionStorage
  const hasSessionToken = !!sessionStorage.getItem('token');
  const hasSessionUser = !!sessionStorage.getItem('user');
  
  // Check cookies
  const hasCookieToken = document.cookie.includes('auth_token=');
  const hasCookieUser = document.cookie.includes('auth_user=');
  
  // Log authentication state for debugging
  console.log('DirectAuth - Authentication check:', {
    globalFlag: !!window.__isAuthenticated,
    localStorage: { token: hasLocalToken, user: hasLocalUser },
    sessionStorage: { token: hasSessionToken, user: hasSessionUser },
    cookies: { token: hasCookieToken, user: hasCookieUser }
  });
  
  // Return true if any storage method has both token and user
  return (hasLocalToken && hasLocalUser) || 
         (hasSessionToken && hasSessionUser) || 
         (hasCookieToken && hasCookieUser);
};

/**
 * Get the current user from any available storage method
 * 
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    // Try localStorage first
    let userStr = localStorage.getItem('user');
    
    // If not in localStorage, try sessionStorage
    if (!userStr) {
      userStr = sessionStorage.getItem('user');
    }
    
    // If not in sessionStorage, try cookies
    if (!userStr) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_user') {
          userStr = decodeURIComponent(value);
          break;
        }
      }
    }
    
    // Parse and return the user object
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
};

/**
 * Directly log out a user by clearing all storage methods and redirecting to home
 */
export const directLogout = () => {
  console.log('DirectAuth - Logging out user');
  
  try {
    // Clear global flag
    window.__isAuthenticated = false;
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('DirectAuth - Cleared all authentication data');
  } catch (e) {
    console.error('Error during logout:', e);
  }
  
  // Redirect to home page
  window.location.href = '/';
};