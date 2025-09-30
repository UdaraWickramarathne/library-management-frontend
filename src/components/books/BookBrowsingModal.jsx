import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/bookService';

const BookBrowsingModal = ({ show, onClose, userId }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [borrowing, setBorrowing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (show) {
      // Reset state when modal opens
      setSearchQuery('');
      setSelectedCategory('all');
      setPage(0);
      setBooks([]);
      setSelectedBook(null);
      setError(null);
      
      // Fetch initial data
      fetchGenres();
      fetchBooks();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setPage(0); // Reset to first page when search changes
      // Add a small delay for search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchBooks();
      }, searchQuery ? 300 : 0);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (show) {
      fetchBooks(); // Fetch when page changes
    }
  }, [page]);

  const fetchGenres = async () => {
    try {
      const response = await bookService.getAllGenres();
      if (response.success) {
        setGenres(['all', ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (searchQuery.trim() || selectedCategory !== 'all') {
        // Use search API with filters
        const filters = {};
        if (searchQuery.trim()) {
          filters.title = searchQuery.trim();
        }
        if (selectedCategory !== 'all') {
          filters.genre = selectedCategory;
        }
        response = await bookService.searchBooks(filters, page, 10);
      } else {
        // Get all available books when no search/filter is applied
        response = await bookService.getAvailableBooks(page, 10);
      }

      if (response.success) {
        // Handle different response structures
        const booksData = response.data?.content || response.data || [];
        const totalPagesData = response.data?.totalPages || Math.ceil((response.data?.totalElements || booksData.length) / 10) || 1;
        
        setBooks(Array.isArray(booksData) ? booksData : []);
        setTotalPages(totalPagesData);
      } else {
        setError(response.message || 'Failed to fetch books');
        setBooks([]);
        setTotalPages(0);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch books');
      setBooks([]);
      setTotalPages(0);
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveBook = async (book) => {
    if (!userId) {
      setError(`User not logged in. Please refresh the page and try again.`);
      return;
    }

    if (!book?.isbn) {
      setError('Invalid book selected. Please try again.');
      return;
    }

    // Additional validation
    if (typeof userId !== 'string' && typeof userId !== 'number') {
      setError(`Invalid user ID format. Please refresh and login again.`);
      return;
    }

    setBorrowing(true);
    try {
      // Ensure userId is a number and ISBN is a string
      const numericUserId = Number(userId);
      const isbnString = String(book.isbn);
      
      const response = await bookService.reserveBook(numericUserId, isbnString, `Reserved from book browser`);
      
      if (response.success) {
        alert(`Successfully reserved "${book.title}". A librarian will checkout the book for you when it becomes available.`);
        setSelectedBook(null);
        fetchBooks(); // Refresh the books list
      } else {
        setError(response.message || 'Failed to reserve book');
      }
    } catch (error) {
      setError(error.message || 'Failed to reserve book');
      console.error('Error reserving book:', error);
    } finally {
      setBorrowing(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.availableCopies > 0 && book.status === 'AVAILABLE'
  );

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white bg-opacity-98 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20 w-full max-w-6xl max-h-[90vh] overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-800">Browse & Reserve Books</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search books by title, author..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Categories' : genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-gray-50 to-white">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                  <div
                    key={book.isbn}
                    className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-opacity-100"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="p-4">
                      {/* Book Cover Placeholder */}
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-semibold text-center px-2">
                          {book.title}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                      <p className="text-gray-500 text-xs mb-2 bg-gray-100 px-2 py-1 rounded-full inline-block">{book.genre}</p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                          {book.availableCopies} available
                        </span>
                        <span className="text-gray-500 text-xs">
                          {book.publicationYear}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBooks.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedBook(null);
            }
          }}
        >
          <div 
            className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-30 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedBook.title}</h3>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {/* Book Cover Placeholder */}
                  <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold text-center px-4">
                      {selectedBook.title}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Author</h4>
                    <p className="text-gray-600">{selectedBook.author}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Genre</h4>
                    <p className="text-gray-600">{selectedBook.genre}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Publisher</h4>
                    <p className="text-gray-600">{selectedBook.publisher}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Publication Year</h4>
                    <p className="text-gray-600">{selectedBook.publicationYear}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">ISBN</h4>
                    <p className="text-gray-600">{selectedBook.isbn}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Availability</h4>
                    <p className="text-green-600 font-medium">
                      {selectedBook.availableCopies} of {selectedBook.totalCopies} copies available
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700">Shelf Location</h4>
                    <p className="text-gray-600">{selectedBook.shelfLocation}</p>
                  </div>
                </div>
              </div>

              {selectedBook.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedBook.description}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleReserveBook(selectedBook)}
                  disabled={borrowing || selectedBook.availableCopies === 0}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {borrowing ? 'Reserving...' : 'Reserve Book'}
                </button>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookBrowsingModal;