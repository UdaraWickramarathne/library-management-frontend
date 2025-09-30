const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8080';
const BOOK_SERVICE_URL = import.meta.env.VITE_BOOK_SERVICE_URL || 'http://localhost:8082';
const ROOM_SERVICE_URL = import.meta.env.VITE_ROOM_SERVICE_URL || 'http://localhost:8081';
const BORROW_SERVICE_URL = import.meta.env.VITE_BORROW_SERVICE_URL || 'http://localhost:8083';

class ApiService {
  constructor(baseURL = USER_SERVICE_URL) {
    this.baseURL = baseURL;
  }

  // Create service instances for different microservices
  static getUserService() {
    return new ApiService(USER_SERVICE_URL);
  }

  static getBookService() {
    return new ApiService(BOOK_SERVICE_URL);
  }

  static getRoomService() {
    return new ApiService(ROOM_SERVICE_URL);
  }

  static getBorrowService() {
    return new ApiService(BORROW_SERVICE_URL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Default export for backward compatibility (user service)
export const apiService = new ApiService();

// Named exports for different services
export const userApiService = ApiService.getUserService();
export const bookApiService = ApiService.getBookService();
export const roomApiService = ApiService.getRoomService();
export const borrowApiService = ApiService.getBorrowService();