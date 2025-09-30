import { apiService } from './api.js';

export const authService = {
  // Login user
  async login(loginData) {
    try {
      const response = await apiService.post('/api/auth/login', loginData);
      if (response.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Validate token
  async validateToken() {
    try {
      const response = await apiService.post('/api/auth/validate');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await apiService.get('/api/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password (first time)
  async changePasswordFirstTime(passwordData) {
    try {
      const response = await apiService.post('/api/auth/change-password-first-time', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
};