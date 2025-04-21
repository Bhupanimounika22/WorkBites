import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import staticUsers from '../data/users';

// Ensure static users are available for login
console.log('Loaded static users:', staticUsers);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(storedToken);
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debug initial state
  console.log('AuthContext - Initial State:', { 
    hasToken: !!storedToken, 
    hasUser: !!storedUser,
    isAuthenticated: !!storedToken
  });

  // Set auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user - simplified and more reliable
  useEffect(() => {
    const loadUser = async () => {
      console.log('AuthContext - Loading user state');
      
      try {
        // Check if we have both token and user in localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // Parse the stored user
            const parsedUser = JSON.parse(storedUser);
            console.log('AuthContext - Found valid user in localStorage:', parsedUser.email);
            
            // Update state
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
            setError(null);
          } catch (parseErr) {
            console.error('AuthContext - Error parsing stored user:', parseErr);
            throw new Error('Invalid user data');
          }
        } else {
          // If we don't have both token and user, clear authentication
          console.log('AuthContext - Missing token or user in localStorage');
          setIsAuthenticated(false);
          
          if (!storedToken) {
            console.log('AuthContext - No token found');
            setToken(null);
          }
          
          if (!storedUser) {
            console.log('AuthContext - No user found');
            setUser(null);
          }
        }
      } catch (err) {
        // If anything goes wrong, clear authentication
        console.error('AuthContext - Error loading user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError('Authentication failed');
      } finally {
        // Always set loading to false when done
        setLoading(false);
        console.log('AuthContext - Finished loading user, isAuthenticated:', isAuthenticated);
      }
    };

    // Load user immediately
    loadUser();
  }, []);

  // Register user - more reliable version
  const register = async (userData) => {
    try {
      console.log('AuthContext - Registering user:', userData);
      
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!userData.name || userData.name.trim() === '') {
        throw new Error('Please enter your name');
      }
      
      // Create a new user
      const newUser = {
        id: 'user_' + Date.now(), // Generate a unique ID
        name: userData.name || userData.email.split('@')[0],
        email: userData.email,
        role: userData.role || 'user',
        phone: userData.phone || '(555) 000-0000'
      };
      
      console.log('AuthContext - Created new user:', newUser);
      
      // Create a fake token (in a real app, this would be a JWT)
      const fakeToken = generateFakeToken(newUser);
      
      // First update state
      setUser(newUser);
      setToken(fakeToken);
      setIsAuthenticated(true);
      setError(null);
      
      // Then store in localStorage
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('AuthContext - Registration successful!', {
        user: newUser.email,
        isAuthenticated: true,
        hasToken: !!fakeToken,
        localStorage: {
          token: localStorage.getItem('token') ? 'exists' : 'missing',
          user: localStorage.getItem('user') ? 'exists' : 'missing'
        }
      });
      
      return { token: fakeToken, user: newUser };
    } catch (err) {
      console.error('AuthContext - Registration error:', err);
      setError(err.message || 'Registration failed');
      throw err;
    }
  };
  
  // Helper function to generate a fake JWT token
  const generateFakeToken = (user) => {
    // Create a simple structure similar to a JWT
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { 
      id: user.id, 
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
    };
    
    // Convert to base64
    const headerStr = btoa(JSON.stringify(header));
    const payloadStr = btoa(JSON.stringify(payload));
    
    // Create a simple signature (not secure, just for demo)
    const signature = btoa(`${headerStr}.${payloadStr}`);
    
    return `${headerStr}.${payloadStr}.${signature}`;
  };

  // Login user - simplified and more reliable version for demo
  const login = async (email, password) => {
    try {
      console.log('AuthContext - Login attempt with email:', email);
      
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // For demo purposes, we'll use hardcoded users
      // In a real app, you would verify credentials with a server
      
      // Hardcoded test users for reliable login
      const testUsers = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@foodpreorder.com',
          role: 'admin',
          phone: '(555) 123-4567'
        },
        {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
          phone: '(555) 987-6543'
        },
        {
          id: '101',
          name: 'Marco Rossi',
          email: 'marco@italianodelizioso.com',
          role: 'restaurant',
          phone: '(555) 111-2222'
        }
      ];
      
      // Find user by email (case insensitive)
      const foundUser = testUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase()
      );
      
      let userToLogin;
      let fakeToken;
      
      if (foundUser) {
        console.log('AuthContext - Found existing test user:', foundUser.email);
        userToLogin = foundUser;
      } else {
        // If email doesn't match any test user, create a new user account
        console.log('AuthContext - Creating new user account for:', email);
        userToLogin = {
          id: 'user_' + Date.now(),
          name: email.split('@')[0], // Use part before @ as name
          email: email,
          role: 'user',
          phone: '(555) 000-0000'
        };
      }
      
      // Create a fake token
      fakeToken = generateFakeToken(userToLogin);
      
      // First update state
      setUser(userToLogin);
      setToken(fakeToken);
      setIsAuthenticated(true);
      setError(null);
      
      // Then store in localStorage
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      
      console.log('AuthContext - Login successful!', {
        user: userToLogin.email,
        isAuthenticated: true,
        hasToken: !!fakeToken
      });
      
      return { token: fakeToken, user: userToLogin };
    } catch (err) {
      console.error('AuthContext - Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Logout user - more reliable version
  const logout = () => {
    console.log('AuthContext - Logging out user');
    
    // First update state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Then clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('AuthContext - User logged out, auth state cleared');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};