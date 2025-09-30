import React, { useState, useEffect } from 'react';
import { bookService } from '../../utils/helpers';

const LibrarianCheckoutModal = ({ 
  show, 
  isOpen, 
  onClose, 
  librarianId, 
  onLoanCreated, 
  onSuccess 
}) => {
  // Support both prop naming conventions
  const isModalOpen = show || isOpen;
  const handleSuccess = onLoanCreated || onSuccess;
  const [studentId, setStudentId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookInfo, setBookInfo] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [fetchingReservations, setFetchingReservations] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      // Reset form when modal opens
      setStudentId('');
      setIsbn('');
      setNotes('');
      setError('');
      setBookInfo(null);
      setReservations([]);
    }
  }, [isModalOpen]);

  const fetchBookInfo = async (bookIsbn) => {
    if (!bookIsbn.trim()) {
      setBookInfo(null);
      setReservations([]);
      return;
    }

    try {
      setFetchingReservations(true);
      const [bookResponse, reservationsResponse] = await Promise.all([
        bookService.getBookByIsbn(bookIsbn.trim()),
        bookService.getBookReservations(bookIsbn.trim())
      ]);

      if (bookResponse.success && bookResponse.data) {
        setBookInfo(bookResponse.data);
      } else {
        setBookInfo(null);
      }

      if (reservationsResponse.success) {
        setReservations(Array.isArray(reservationsResponse.data) ? reservationsResponse.data : []);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching book info:', error);
      setBookInfo(null);
      setReservations([]);
    } finally {
      setFetchingReservations(false);
    }
  };

  const handleIsbnChange = (e) => {
    const newIsbn = e.target.value;
    setIsbn(newIsbn);
    
    // Debounce book info fetching
    if (newIsbn.trim().length >= 10) {
      const timeoutId = setTimeout(() => {
        fetchBookInfo(newIsbn);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setBookInfo(null);
      setReservations([]);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim() || !isbn.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!librarianId) {
      setError('Librarian ID not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await bookService.createLoan(
        Number(studentId.trim()),
        isbn.trim(),
        Number(librarianId),
        notes.trim()
      );

      if (response.success) {
        alert(`Successfully created loan for student ${studentId}`);
        onClose();
        if (handleSuccess) {
          handleSuccess();
        }
      } else {
        setError(response.message || 'Failed to create loan');
      }
    } catch (error) {
      setError(error.message || 'Failed to create loan');
      console.error('Error creating loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectStudentFromReservation = (reservation) => {
    setStudentId(reservation.userId.toString());
  };

  if (!isModalOpen) return null;

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
        className="bg-white bg-opacity-98 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20 w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-800">Checkout Book (Create Loan)</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateLoan} className="space-y-6">
            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="number"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white shadow-sm transition-all"
                placeholder="Enter student ID"
                required
              />
            </div>

            {/* Book ISBN */}
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                Book ISBN *
              </label>
              <input
                type="text"
                id="isbn"
                value={isbn}
                onChange={handleIsbnChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white shadow-sm transition-all"
                placeholder="Enter or scan book ISBN"
                required
              />
            </div>

            {/* Book Information */}
            {bookInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Title:</span>
                    <span className="text-blue-700 ml-2">{bookInfo.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Author:</span>
                    <span className="text-blue-700 ml-2">{bookInfo.author}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Available Copies:</span>
                    <span className={`ml-2 font-medium ${
                      bookInfo.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bookInfo.availableCopies} of {bookInfo.totalCopies}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Location:</span>
                    <span className="text-blue-700 ml-2">{bookInfo.shelfLocation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reservations Queue */}
            {reservations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-900 mb-3">Active Reservations Queue</h3>
                <div className="space-y-2">
                  {reservations.slice(0, 5).map((reservation, index) => (
                    <div key={reservation.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Student ID: {reservation.userId}
                          </p>
                          <p className="text-xs text-gray-500">
                            Reserved: {new Date(reservation.reservationDate).toLocaleDateString()}
                            {' | Expires: '}{new Date(reservation.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectStudentFromReservation(reservation)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                  {reservations.length > 5 && (
                    <p className="text-xs text-yellow-700 text-center">
                      +{reservations.length - 5} more reservations...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {bookInfo?.availableCopies === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ No Available Copies</h3>
                <p className="text-red-700 text-sm">
                  This book has no available copies. Checkout will fail unless a copy is returned first.
                </p>
              </div>
            )}

            {reservations.length > 0 && studentId && !reservations.some(r => r.userId.toString() === studentId) && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-semibold text-orange-900 mb-2">⚠️ Reservation Notice</h3>
                <p className="text-orange-700 text-sm">
                  This book has {reservations.length} active reservation(s). The selected student is not in the reservation queue.
                  Checkout may be blocked by the system to prioritize reserved students.
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white shadow-sm transition-all resize-none"
                placeholder="Optional notes about this checkout..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !studentId.trim() || !isbn.trim() || fetchingReservations}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creating Loan...' : 'Create Loan (Checkout)'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LibrarianCheckoutModal;