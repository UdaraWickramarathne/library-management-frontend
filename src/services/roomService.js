import { apiService } from './api.js';

const ROOM_SERVICE_URL = import.meta.env.VITE_ROOM_SERVICE_URL || 'http://localhost:8081';

// Create API service instance for room service
const roomApiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${ROOM_SERVICE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage;
        
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = errorData || `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Room API Error:', error);
      throw error;
    }
  },

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};

export const roomService = {
  // Health check
  async healthCheck() {
    try {
      const response = await roomApiService.get('/api/rooms/health');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Room Management
  async getAllRooms() {
    try {
      const response = await roomApiService.get('/api/rooms');
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getRoomById(id) {
    try {
      const response = await roomApiService.get(`/api/rooms/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getAvailableRooms(date) {
    try {
      const response = await roomApiService.get(`/api/rooms/available?date=${date}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getRoomsByCapacity(minCapacity) {
    try {
      const response = await roomApiService.get(`/api/rooms/by-capacity?minCapacity=${minCapacity}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getRoomsByFacilities(facilities) {
    try {
      const facilitiesParam = Array.isArray(facilities) 
        ? facilities.map(f => `facilities=${encodeURIComponent(f)}`).join('&')
        : `facilities=${encodeURIComponent(facilities)}`;
      const response = await roomApiService.get(`/api/rooms/by-facilities?${facilitiesParam}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createRoom(roomData) {
    try {
      const response = await roomApiService.post('/api/rooms', roomData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Booking Management
  async createBooking(bookingData) {
    try {
      const response = await roomApiService.post('/api/bookings', bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getBookingById(id) {
    try {
      const response = await roomApiService.get(`/api/bookings/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserBookings(userId) {
    try {
      const response = await roomApiService.get(`/api/bookings/user/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserBookingsPaginated(userId, page = 0, size = 10, sort = 'bookingDate,desc') {
    try {
      const response = await roomApiService.get(`/api/bookings/user/${userId}/paginated?page=${page}&size=${size}&sort=${sort}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getPendingBookings(page = 0, size = 20, sort = 'createdAt,asc') {
    try {
      const response = await roomApiService.get(`/api/bookings/pending?page=${page}&size=${size}&sort=${sort}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async approveBooking(bookingId, librarianId) {
    try {
      const response = await roomApiService.put(`/api/bookings/${bookingId}/approve?librarianId=${librarianId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async rejectBooking(bookingId, librarianId, rejectionData) {
    try {
      const response = await roomApiService.put(`/api/bookings/${bookingId}/reject?librarianId=${librarianId}`, rejectionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async cancelBooking(bookingId, userId) {
    try {
      const response = await roomApiService.delete(`/api/bookings/${bookingId}/cancel?userId=${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getAlternativeRooms(roomId, date, startTime, endTime) {
    try {
      const response = await roomApiService.get(`/api/bookings/alternatives?roomId=${roomId}&date=${date}&startTime=${startTime}&endTime=${endTime}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reports (Admin only)
  async getBookingReports(startDate, endDate, page = 0, size = 50, sort = 'createdAt,desc') {
    try {
      const response = await roomApiService.get(`/api/reports/bookings?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}&sort=${sort}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};