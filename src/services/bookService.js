import { bookApiService, borrowApiService } from './api';

const bookService = {
  // Health check
  healthCheck: async () => {
    return await bookApiService.get('/api/books/health');
  },

  // Book metadata operations
  fetchBookMetadata: async (isbn) => {
    return await bookApiService.get(`/api/books/metadata/${isbn}`);
  },

  // Book CRUD operations
  createBookWithMetadata: async (bookData) => {
    return await bookApiService.post('/api/books/with-metadata', bookData);
  },

  createBook: async (bookData) => {
    return await bookApiService.post('/api/books', bookData);
  },

  getAllBooks: async (page = 0, size = 10, sort = 'title') => {
    return await bookApiService.get(`/api/books?page=${page}&size=${size}&sort=${sort}`);
  },

  getBookByIsbn: async (isbn) => {
    return await bookApiService.get(`/api/books/${isbn}`);
  },

  updateBook: async (isbn, bookData) => {
    return await bookApiService.put(`/api/books/${isbn}`, bookData);
  },

  deleteBook: async (isbn) => {
    return await bookApiService.delete(`/api/books/${isbn}`);
  },

  // Book inventory management
  markBookAsLost: async (isbn, markLostRequest) => {
    return await bookApiService.patch(`/api/books/${isbn}/mark-lost`, markLostRequest);
  },

  addCopies: async (isbn, addCopiesRequest) => {
    return await bookApiService.patch(`/api/books/${isbn}/add-copies`, addCopiesRequest);
  },

  // Book search and filtering
  searchBooks: async (filters, page = 0, size = 10, sort = 'title') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);
    
    if (filters.title) params.append('title', filters.title);
    if (filters.author) params.append('author', filters.author);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.status) params.append('status', filters.status);
    
    return await bookApiService.get(`/api/books/search?${params.toString()}`);
  },

  getAvailableBooks: async (page = 0, size = 10, sort = 'title') => {
    return await bookApiService.get(`/api/books/available?page=${page}&size=${size}&sort=${sort}`);
  },

  getAllGenres: async () => {
    return await bookApiService.get('/api/books/genres');
  },

  getLowStockBooks: async (threshold = 5) => {
    return await bookApiService.get(`/api/books/low-stock?threshold=${threshold}`);
  },

  // Borrowing operations (now using borrow-service)
  borrowBook: async (userId, isbn) => {
    const requestBody = { userId, isbn };
    
    return await borrowApiService.post('/api/loans/borrow', requestBody);
  },

  returnBook: async (userId, isbn, notes = '') => {
    return await borrowApiService.post('/api/loans/return', { userId, isbn, notes });
  },

  renewLoan: async (userId, borrowRecordId, notes = '') => {
    return await borrowApiService.post('/api/loans/renew', { userId, borrowRecordId, notes });
  },

  // Borrow records and history (now using borrow-service)
  getUserBorrowHistory: async (userId, page = 0, size = 10) => {
    return await borrowApiService.get(`/api/loans/user/${userId}/history?page=${page}&size=${size}`);
  },

  getBookBorrowHistory: async (isbn, page = 0, size = 10) => {
    return await borrowApiService.get(`/api/loans/book/${isbn}/history?page=${page}&size=${size}`);
  },

  getUserActiveBorrows: async (userId) => {
    return await borrowApiService.get(`/api/loans/user/${userId}/active`);
  },

  getAllBorrowRecords: async (page = 0, size = 10) => {
    return await borrowApiService.get(`/api/loans?page=${page}&size=${size}`);
  },

  // Library management (now using borrow-service)
  getOverdueBooks: async () => {
    return await borrowApiService.get('/api/loans/overdue');
  },

  getBooksDueSoon: async (days = 3) => {
    return await borrowApiService.get(`/api/loans/due-soon?days=${days}`);
  },

  updateOverdueStatus: async () => {
    return await borrowApiService.post('/api/loans/update-overdue');
  }
};

export { bookService };