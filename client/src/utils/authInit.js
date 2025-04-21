/**
 * Authentication initialization script
 * This script runs when the app starts to ensure the authentication state is properly set
 */

// Initialize the global authentication flag
const initAuth = () => {
  console.log('AuthInit - Initializing authentication state');
  
  try {
    // Check localStorage
    const hasLocalToken = !!localStorage.getItem('token');
    const hasLocalUser = !!localStorage.getItem('user');
    
    // Check sessionStorage
    const hasSessionToken = !!sessionStorage.getItem('token');
    const hasSessionUser = !!sessionStorage.getItem('user');
    
    // Check cookies
    const hasCookieToken = document.cookie.includes('auth_token=');
    const hasCookieUser = document.cookie.includes('auth_user=');
    
    // Set the global flag if any storage method has both token and user
    const isAuthenticated = (hasLocalToken && hasLocalUser) || 
                           (hasSessionToken && hasSessionUser) || 
                           (hasCookieToken && hasCookieUser);
    
    window.__isAuthenticated = isAuthenticated;
    
    // Log the authentication state
    console.log('AuthInit - Authentication state:', {
      isAuthenticated,
      localStorage: { token: hasLocalToken, user: hasLocalUser },
      sessionStorage: { token: hasSessionToken, user: hasSessionUser },
      cookies: { token: hasCookieToken, user: hasCookieUser }
    });
    
    // If we have authentication in sessionStorage or cookies but not in localStorage, copy it to localStorage
    if (!hasLocalToken && !hasLocalUser && ((hasSessionToken && hasSessionUser) || (hasCookieToken && hasCookieUser))) {
      console.log('AuthInit - Copying authentication data to localStorage');
      
      // Try sessionStorage first
      if (hasSessionToken && hasSessionUser) {
        localStorage.setItem('token', sessionStorage.getItem('token'));
        localStorage.setItem('user', sessionStorage.getItem('user'));
      }
      // Then try cookies
      else if (hasCookieToken && hasCookieUser) {
        const cookies = document.cookie.split(';');
        let token, user;
        
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'auth_token') {
            token = decodeURIComponent(value);
          } else if (name === 'auth_user') {
            user = decodeURIComponent(value);
          }
        }
        
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', user);
        }
      }
    }
    
    return isAuthenticated;
  } catch (e) {
    console.error('AuthInit - Error initializing authentication state:', e);
    return false;
  }
};

// Run the initialization
const isAuthenticated = initAuth();

export default isAuthenticated;