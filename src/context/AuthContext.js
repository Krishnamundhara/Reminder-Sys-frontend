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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const data = await authService.getAuthStatus();
        if (data.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeAuth();
    }
  }, [initialized]);

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const data = await authService.getAuthStatus();
      if (data.authenticated) {
        setCurrentUser(data.user);
        return data.user;
      } else if (localStorage.getItem('currentUser')) {
        // If we have local data but server says not authenticated,
        // try to restore the session
        try {
          await authService.restoreSession();
          const retryData = await authService.getAuthStatus();
          if (retryData.authenticated) {
            setCurrentUser(retryData.user);
            return retryData.user;
          }
        } catch (retryError) {
          console.error('Failed to restore session:', retryError);
        }
        // If restoration fails, clear everything
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Only clear on actual auth errors, not network errors
      if (error.response?.status === 401) {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
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
      // Clear any existing user data
      setCurrentUser(null);
      
      // Attempt login
      const data = await authService.login({ username, password });
      
      if (data.success && data.user) {
        // Verify the session is active
        const verifyData = await authService.getAuthStatus();
        
        if (verifyData.authenticated) {
          setCurrentUser(verifyData.user);
          return { success: true, user: verifyData.user };
        } else {
          throw new Error('Session verification failed');
        }
      }
      
      return {
        success: false,
        message: data.message || 'Login failed with unknown error'
      };
    } catch (error) {
      console.error('Login error:', error);
      setCurrentUser(null);
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
