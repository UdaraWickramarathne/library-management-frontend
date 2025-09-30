// Utility functions for the Library Management System

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const calculateDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getBookStatus = (totalCopies, availableCopies) => {
  if (availableCopies === 0) return 'Out of Stock';
  if (availableCopies <= 2) return 'Low Stock';
  return 'Available';
};

export const getUserRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-500/20 text-red-400';
    case 'librarian':
      return 'bg-primary-500/20 text-primary-400';
    case 'student':
      return 'bg-blue-500/20 text-blue-400';
    case 'faculty':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

// API Base URLs
const API_BASE_URL = 'http://localhost:8082';
const BORROW_SERVICE_URL = 'http://localhost:8083';
const PAYMENT_SERVICE_URL = 'http://localhost:8084';

// Book Service - API functions for book operations
export const bookService = {
  // Get available books with pagination and filters
  async getAvailableBooks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.author) queryParams.append('author', params.author);
      
      const response = await fetch(`${API_BASE_URL}/api/books/available?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching available books:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch books'
      };
    }
  },

  // Get user's active borrows
  async getUserActiveBorrows(userId) {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/user/${userId}/active`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching user borrows:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch borrowed books'
      };
    }
  },

  // Borrow a book (deprecated - use reservation system)
  async borrowBook(isbn, userId) {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          isbn: isbn
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error borrowing book:', error);
      return {
        success: false,
        message: error.message || 'Failed to borrow book'
      };
    }
  },

  // Return a book
  async returnBook(userId, isbn, notes = '') {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          isbn: isbn,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error returning book:', error);
      return {
        success: false,
        message: error.message || 'Failed to return book'
      };
    }
  },

  // Get all books (for admin/librarian)
  async getAllBooks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await fetch(`${API_BASE_URL}/api/books?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching all books:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch books'
      };
    }
  },

  // Get book by ID
  async getBookById(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch book'
      };
    }
  },

  // Get all borrow records with pagination
  async getAllBorrowRecords(page = 0, size = 50) {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans?page=${page}&size=${size}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data  // Return the inner data if it exists (handles ApiResponse wrapper)
      };
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch borrow records'
      };
    }
  },

  // Get overdue books
  async getOverdueBooks() {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/overdue`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data  // Return the inner data if it exists (handles ApiResponse wrapper)
      };
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch overdue books'
      };
    }
  },

  // Renew a loan
  async renewLoan(userId, loanId, notes = '') {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          borrowRecordId: loanId,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error renewing loan:', error);
      return {
        success: false,
        message: error.message || 'Failed to renew loan'
      };
    }
  },

  // Get book by ISBN
  async getBookByIsbn(isbn) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${isbn}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: 'Book not found'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching book by ISBN:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch book'
      };
    }
  },

  // Get book reservations
  async getBookReservations(isbn) {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/book/${isbn}/reservations`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: []
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data || []
      };
    } catch (error) {
      console.error('Error fetching book reservations:', error);
      return {
        success: true,
        data: []
      };
    }
  },

  // Create a loan (checkout book)
  async createLoan(studentId, isbn, librarianId, notes = '') {
    try {
      const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          isbn: isbn,
          librarianId: librarianId,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error creating loan:', error);
      return {
        success: false,
        message: error.message || 'Failed to create loan'
      };
    }
  }
};

// Standalone function exports for easier imports
export const getUserActiveBorrows = (userId) => bookService.getUserActiveBorrows(userId);
export const markBookAsReturned = (userId, isbn, notes = '') => bookService.returnBook(userId, isbn, notes);
export const createLoan = (studentId, isbn, librarianId, notes = '') => bookService.createLoan(studentId, isbn, librarianId, notes);

// Mark book as lost (librarian only)
export const markBookAsLost = async (borrowRecordId, markedByUserId, replacementCost, notes) => {
  try {
    const response = await fetch(`${BORROW_SERVICE_URL}/api/loans/mark-lost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        borrowRecordId: borrowRecordId,
        markedByUserId: markedByUserId,
        replacementCost: replacementCost,
        notes: notes
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking book as lost:', error);
    throw error;
  }
};

// Payment Service - API functions for payment and fine operations
export const paymentService = {
  // Get user's pending fines
  async getUserPendingFines(userId) {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/user/${userId}/pending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching user pending fines:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch pending fines'
      };
    }
  },

  // Get user's total outstanding fines
  async getUserOutstandingFines(userId) {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/user/${userId}/outstanding`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching user outstanding fines:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch outstanding fines'
      };
    }
  },

  // Get user's fine history with pagination
  async getUserFines(userId, page = 0, size = 10) {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/user/${userId}?page=${page}&size=${size}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching user fines:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user fines'
      };
    }
  },

  // Process payment for a fine
  async processPayment(fineId, userId, amount, method, notes = '') {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fineId: fineId,
          userId: userId,
          amount: amount,
          method: method,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: error.message || 'Failed to process payment'
      };
    }
  },

  // Waive a fine (librarian only)
  async waiveFine(fineId, librarianId, reason, notes = '') {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/waive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fineId: fineId,
          waivedBy: librarianId,
          reason: reason,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error waiving fine:', error);
      return {
        success: false,
        message: error.message || 'Failed to waive fine'
      };
    }
  },

  // Get all fines (admin/librarian)
  async getAllFines(page = 0, size = 20, status = null) {
    try {
      let url = `${PAYMENT_SERVICE_URL}/api/payments/fines?page=${page}&size=${size}`;
      if (status) {
        url = `${PAYMENT_SERVICE_URL}/api/payments/fines/status/${status}?page=${page}&size=${size}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching all fines:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch fines'
      };
    }
  },

  // Check if user has pending fines
  async hasUserPendingFines(userId) {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/fines/user/${userId}/has-pending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || false
      };
    } catch (error) {
      console.error('Error checking pending fines:', error);
      return {
        success: false,
        data: false
      };
    }
  },

  // Get payment summary (for loans page statistics)
  async getPaymentSummary() {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/payments/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment summary'
      };
    }
  },

  // Get payment summary by date range
  async getPaymentSummaryByDateRange(startDate, endDate) {
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/payments/summary/range?startDate=${startDate}&endDate=${endDate}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching payment summary by date range:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment summary'
      };
    }
  }
};