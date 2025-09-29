import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/bookService';

const BorrowedBooksModal = ({ show, onClose, userId }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);

  useEffect(() => {
    if (show && userId) {
      fetchBorrowedBooks();
    }
  }, [show, userId]);

  const fetchBorrowedBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookService.getUserActiveBorrows(userId);
      if (response.success) {
        setBorrowedBooks(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch borrowed books');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch borrowed books');
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (borrow) => {
    setSelectedBorrow(borrow);
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const handleReturnBook = async () => {
    if (!selectedBorrow) return;

    setReturning(selectedBorrow.id);
    try {
      const response = await bookService.returnBook(
        userId, 
        selectedBorrow.bookIsbn, 
        returnNotes
      );
      
      if (response.success) {
        alert(`Successfully returned "${selectedBorrow.book?.title || 'book'}"`);
        setShowReturnModal(false);
        setSelectedBorrow(null);
        setReturnNotes('');
        fetchBorrowedBooks(); // Refresh the list
      } else {
        setError(response.message || 'Failed to return book');
      }
    } catch (error) {
      setError(error.message || 'Failed to return book');
      console.error('Error returning book:', error);
    } finally {
      setReturning(null);
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dueDate) => {
    const daysLeft = calculateDaysLeft(dueDate);
    if (daysLeft < 0) return { status: 'overdue', className: 'text-red-600', text: `${Math.abs(daysLeft)} days overdue` };
    if (daysLeft <= 3) return { status: 'due-soon', className: 'text-orange-600', text: `Due in ${daysLeft} days` };
    return { status: 'normal', className: 'text-green-600', text: `${daysLeft} days left` };
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">My Borrowed Books</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="m-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : borrowedBooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">No books currently borrowed</p>
                <p className="text-gray-400 text-sm mt-2">Browse available books to start reading!</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid gap-4">
                  {borrowedBooks.map((borrow) => {
                    const dueDateInfo = getDueDateStatus(borrow.dueDate);
                    
                    return (
                      <div
                        key={borrow.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Book Cover */}
                          <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold text-center px-1">
                              {borrow.book?.title?.substring(0, 15) || 'Book'}
                            </span>
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {borrow.book?.title || 'Unknown Title'}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              by {borrow.book?.author || 'Unknown Author'}
                            </p>
                            <p className="text-gray-500 text-sm mb-2">
                              ISBN: {borrow.bookIsbn}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Borrowed: </span>
                                <span className="text-gray-700">
                                  {new Date(borrow.borrowDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Due: </span>
                                <span className={dueDateInfo.className}>
                                  {new Date(borrow.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className={dueDateInfo.className + ' font-medium'}>
                                  {dueDateInfo.text}
                                </span>
                              </div>
                            </div>

                            {borrow.fineAmount && borrow.fineAmount > 0 && (
                              <div className="mt-2">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                  Fine: ${borrow.fineAmount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col justify-center gap-2">
                            <button
                              onClick={() => handleReturnClick(borrow)}
                              disabled={returning === borrow.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {returning === borrow.id ? 'Returning...' : 'Return Book'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {showReturnModal && selectedBorrow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Return Book
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to return "{selectedBorrow.book?.title}"?
                </p>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Notes (Optional)
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Any issues with the book? (damage, missing pages, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReturnBook}
                  disabled={returning}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {returning ? 'Returning...' : 'Confirm Return'}
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedBorrow(null);
                    setReturnNotes('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BorrowedBooksModal;