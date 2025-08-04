import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize with data from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const data = await authService.getAuthStatus();
      if (data.authenticated) {
        setCurrentUser(data.user);
        return data.user;
      } else {
        // If server says we're not authenticated, clear local storage
        setCurrentUser(null);
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Don't clear currentUser on network errors to allow offline functionality
      return null;
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Fall back to localStorage data if we already have it
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    // Set up periodic refresh of authentication status (every 5 minutes)
    const refreshInterval = setInterval(refreshUserData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      const data = await authService.login({ username, password });
      if (data.success) {
        console.log('Login successful, updating user data');
        // Update state and localStorage in one go
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return {
        success: false,
        message: data.message || 'Login failed with unknown error'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const data = await authService.signup(userData);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      // Clear local storage first to prevent flash of authenticated state on refresh
      localStorage.removeItem('currentUser');
      
      // Then call API
      await authService.logout();
      
      // Finally update React state
      setCurrentUser(null);
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still clear local state
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed. Please try again.'
      };
    }
  };

  const updateUserContext = (updatedUserData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUserData
    }));
    return { success: true };
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    updateUserContext,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
