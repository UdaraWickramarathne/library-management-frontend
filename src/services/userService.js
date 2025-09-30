import { apiService } from './api.js';

export const userService = {
  // Get all users with pagination
  async getAllUsers(page = 0, size = 10, sort = 'createdAt') {
    try {
      const response = await apiService.get(`/api/users?page=${page}&size=${size}&sort=${sort}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await apiService.get(`/api/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const response = await apiService.get(`/api/users/email/${email}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create admin
  async createAdmin(adminData) {
    try {
      const response = await apiService.post('/api/users/admins', adminData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create librarian
  async createLibrarian(librarianData) {
    try {
      const response = await apiService.post('/api/users/librarians', librarianData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create student
  async createStudent(studentData) {
    try {
      const response = await apiService.post('/api/users/students', studentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiService.put(`/api/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Activate user
  async activateUser(id) {
    try {
      const response = await apiService.patch(`/api/users/${id}/activate`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Deactivate user
  async deactivateUser(id) {
    try {
      const response = await apiService.patch(`/api/users/${id}/deactivate`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  async changePassword(id, passwordData) {
    try {
      const response = await apiService.patch(`/api/users/${id}/change-password`, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await apiService.get('/api/users/health');
      return response;
    } catch (error) {
      throw error;
    }
  }
};