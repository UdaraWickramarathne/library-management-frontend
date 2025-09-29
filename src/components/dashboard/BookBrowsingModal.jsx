import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';

const BookBrowsingModal = ({ onClose, onBookBorrowed }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBorrowConfirm, setShowBorrowConfirm] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  const booksPerPage = 12;

  useEffect(() => {
    loadBooks();
  }, [currentPage, searchTerm, categoryFilter, authorFilter]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (searchTerm || categoryFilter || authorFilter) {
        // Use search API with filters
        const filters = {};
        if (searchTerm) filters.title = searchTerm;
        if (categoryFilter) filters.genre = categoryFilter;
        if (authorFilter) filters.author = authorFilter;
        
        response = await bookService.searchBooks(filters, currentPage - 1, booksPerPage);
      } else {
        // Get all available books
        response = await bookService.getAvailableBooks(currentPage - 1, booksPerPage);
      }
      
      if (response.success) {
        setBooks(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Failed to load books');
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilter = (type, value) => {
    if (type === 'category') {
      setCategoryFilter(value);
    } else if (type === 'author') {
      setAuthorFilter(value);
    }
    setCurrentPage(1);
  };

  const handleBorrowBook = async () => {
    if (!selectedBook || !user) return;
    
    try {
      setBorrowing(true);
      const response = await bookService.borrowBook(user.id, selectedBook.isbn);
      
      if (response.success) {
        setShowBorrowConfirm(false);
        setSelectedBook(null);
        onBookBorrowed?.();
        loadBooks(); // Refresh the books list
      } else {
        setError(response.message || 'Failed to borrow book');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      setError('Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  const categories = [...new Set(books.map(book => book.category).filter(Boolean))];
  const authors = [...new Set(books.map(book => book.author).filter(Boolean))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Browse Books</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Books
              </label>
              <Input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => handleFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Author
              </label>
              <select
                value={authorFilter}
                onChange={(e) => handleFilter('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{book.author}</p>
                    <p className="text-xs text-gray-400 mb-3">{book.category}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        book.availableCopies > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBook(book);
                          setShowBorrowConfirm(true);
                        }}
                        disabled={book.availableCopies === 0}
                      >
                        Borrow
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center p-6 border-t bg-gray-50">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Borrow Confirmation Modal */}
      {showBorrowConfirm && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Book Borrowing
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to borrow "<strong>{selectedBook.title}</strong>" by {selectedBook.author}?
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleBorrowBook}
                  disabled={borrowing}
                  className="flex-1"
                >
                  {borrowing ? 'Borrowing...' : 'Yes, Borrow Book'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBorrowConfirm(false);
                    setSelectedBook(null);
                  }}
                  disabled={borrowing}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookBrowsingModal;