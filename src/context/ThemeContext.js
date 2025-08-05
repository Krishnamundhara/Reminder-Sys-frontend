import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();
const THEME_KEY = 'reminder-sys-theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return 'light';
    }
  });

  // Update HTML data-theme attribute when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Apply theme to root element
      document.documentElement.setAttribute('data-theme', theme);
      
      // Save to localStorage
      localStorage.setItem(THEME_KEY, theme);
      
      // Add animation class for transition and remove it after transition completes
      document.body.classList.add('theme-transition');
      const timer = setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        try {
          // Only update if user hasn't explicitly set a preference
          if (!localStorage.getItem(THEME_KEY)) {
            setTheme(mediaQuery.matches ? 'dark' : 'light');
          }
        } catch (e) {
          console.error('Error in media query handler:', e);
        }
      };

      // Initial call
      handleChange();
      
      // Add listener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    } catch (e) {
      console.error('Error setting up media query listener:', e);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
