import axios from 'axios';

// Create axios instance with enhanced configuration for persistent sessions
const API_URL = process.env.REACT_APP_API_URL || 'https://reminder-sys-backend.onrender.com/api';

// Log the API URL in development to help with debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 10000
});

// Add response interceptor to handle session expiry
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.restoreSession();
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Restore session from local storage
  restoreSession: async () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      try {
        await api.post('/auth/restore-session', { userId: user.id });
        return true;
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('currentUser');
        throw error;
      }
    }
    return false;
  },
  // Get authentication status
  getAuthStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data;
    } catch (error) {
      console.error('Email check error:', error);
      throw error;
    }
  },
  
  // Check if phone number exists
  checkPhoneExists: async (phoneNumber) => {
    try {
      const response = await api.post('/auth/check-phone', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Phone check error:', error);
      throw error;
    }
  },
  
  // Send OTP to email for verification
  sendOtp: async (email) => {
    try {
      console.log(`API calling send-otp with email: ${email}`);
      const response = await api.post('/auth/send-otp', { 
        email: email.toLowerCase().trim() // Normalize email
      });
      console.log('API send-otp response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  
  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      console.log(`API calling verify-otp with email: ${email} and OTP: ${otp}`);
      const response = await api.post('/auth/verify-otp', { 
        email: email.toLowerCase().trim(), // Normalize email
        otp: otp.toString().trim() // Normalize OTP
      });
      console.log('API verify-otp response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Register a new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get pending status
  getPendingStatus: async () => {
    try {
      const response = await api.get('/auth/pending');
      return response.data;
    } catch (error) {
      console.error('Error getting pending status:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

// Admin services
export const adminService = {
  // Get admin dashboard data
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Admin dashboard error:', error);
      throw error;
    }
  },

  // Get pending users
  getPendingUsers: async () => {
    try {
      const response = await api.get('/admin/pending-users');
      return response.data;
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  },

  // Approve a user
  approveUser: async (userId) => {
    try {
      const response = await api.post(`/admin/approve-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('User approval error:', error);
      throw error;
    }
  },

  // Reject a user
  rejectUser: async (userId) => {
    try {
      const response = await api.post(`/admin/reject-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('User rejection error:', error);
      throw error;
    }
  },

  // Deactivate a user
  deactivateUser: async (userId) => {
    try {
      const response = await api.post(`/admin/deactivate-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('User deactivation error:', error);
      throw error;
    }
  },

  // Reactivate a user
  reactivateUser: async (userId) => {
    try {
      const response = await api.post(`/admin/reactivate-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('User reactivation error:', error);
      throw error;
    }
  },
  
  // Delete a user permanently
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/delete-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  },
  
  // Get user detailed information (including password)
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/user-details/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  },
  
  // Get approved users
  getApprovedUsers: async () => {
    try {
      const response = await api.get('/admin/approved-users');
      return response.data;
    } catch (error) {
      console.error('Error getting approved users:', error);
      throw error;
    }
  }
};

// User services
export const userService = {
  // Get user dashboard data
  getDashboard: async () => {
    try {
      const response = await api.get('/user/dashboard');
      return response.data;
    } catch (error) {
      console.error('User dashboard error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('User profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.post('/user/update-profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/user/delete-account');
      return response.data;
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
};

export default api;
