import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';

const BorrowedBooksModal = ({ onClose, onBookReturned }) => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (user) {
      loadBorrowedBooks();
    }
  }, [user]);

  const loadBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await bookService.getUserActiveBorrows(user.id);
      
      if (response.success) {
        setBorrowedBooks(response.data || []);
      } else {
        setError('Failed to load borrowed books');
      }
    } catch (error) {
      console.error('Error loading borrowed books:', error);
      setError('Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!selectedBook || !user) return;
    
    try {
      setReturning(true);
      const response = await bookService.returnBook(user.id, selectedBook.book?.isbn, 'Returned via dashboard');
      
      if (response.success) {
        setShowReturnConfirm(false);
        setSelectedBook(null);
        onBookReturned?.();
        loadBorrowedBooks(); // Refresh the list
      } else {
        setError(response.message || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      setError('Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  const calculateFine = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays * 1; // $1 per day fine
    }
    return 0;
  };

  const getDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalFines = borrowedBooks.reduce((total, borrow) => {
    return total + calculateFine(borrow.dueDate);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Borrowed Books</h2>
            {totalFines > 0 && (
              <p className="text-sm text-red-600 mt-1">
                Total Outstanding Fines: ${totalFines.toFixed(2)}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : borrowedBooks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books borrowed</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't borrowed any books yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {borrowedBooks.map((borrow) => {
                const dueDate = new Date(borrow.dueDate);
                const daysLeft = getDaysLeft(borrow.dueDate);
                const fine = calculateFine(borrow.dueDate);
                const isOverdue = daysLeft < 0;
                
                return (
                  <Card key={borrow.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{borrow.book?.title || 'Unknown Title'}</h3>
                          <p className="text-sm text-gray-500">{borrow.book?.author || 'Unknown Author'}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">
                              Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Due: {dueDate.toLocaleDateString()}
                            </p>
                          </div>
                          {fine > 0 && (
                            <p className="text-sm text-red-600 font-medium mt-1">
                              Fine: ${fine.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          isOverdue
                            ? 'bg-red-100 text-red-800'
                            : daysLeft <= 3
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue
                            ? `${Math.abs(daysLeft)} days overdue`
                            : `${daysLeft} days left`
                          }
                        </span>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedBook(borrow);
                            setShowReturnConfirm(true);
                          }}
                        >
                          Return Book
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with summary */}
        {borrowedBooks.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total Books: {borrowedBooks.length}
              </span>
              {totalFines > 0 && (
                <span className="text-red-600 font-medium">
                  Total Fines: ${totalFines.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Return Confirmation Modal */}
      {showReturnConfirm && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Book Return
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to return "<strong>{selectedBook.book?.title}</strong>"?
              </p>
              
              {calculateFine(selectedBook.dueDate) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Overdue Fine: ${calculateFine(selectedBook.dueDate).toFixed(2)}
                      </p>
                      <p className="text-xs text-yellow-700">
                        This fine will be added to your account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleReturnBook}
                  disabled={returning}
                  className="flex-1"
                >
                  {returning ? 'Returning...' : 'Yes, Return Book'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReturnConfirm(false);
                    setSelectedBook(null);
                  }}
                  disabled={returning}
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

export default BorrowedBooksModal;