import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/bookService';

const ReservationsModal = ({ show, onClose, userId, onReservationCancelled }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (show && userId) {
      fetchReservations();
    }
  }, [show, userId]);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookService.getUserActiveReservations(userId);
      
      if (response.success) {
        setReservations(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.message || 'Failed to fetch reservations');
        setReservations([]);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch reservations');
      setReservations([]);
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservation) => {
    if (!reservation?.id) return;
    
    const confirmCancel = window.confirm(`Are you sure you want to cancel your reservation for "${reservation.book?.title}"?`);
    
    if (confirmCancel) {
      setCancelling(reservation.id);
      try {
        const response = await bookService.cancelReservation(reservation.id, userId);
        
        if (response.success) {
          alert(`Successfully cancelled reservation for "${reservation.book?.title}"`);
          fetchReservations(); // Refresh the reservations list
          if (onReservationCancelled) {
            onReservationCancelled();
          }
        } else {
          alert('Failed to cancel reservation: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Failed to cancel reservation: ' + error.message);
      } finally {
        setCancelling(null);
      }
    }
  };

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
        className="bg-white bg-opacity-98 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20 w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-800">My Reservations</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-gray-50 to-white">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
          ) : (
            <>
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Reservations</h3>
                  <p className="text-gray-500">
                    You don't have any active book reservations. Browse books to make a reservation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => {
                    const reservationDate = new Date(reservation.reservationDate);
                    const expiryDate = new Date(reservation.expiryDate);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysUntilExpiry <= 2;
                    const isExpired = daysUntilExpiry < 0;
                    
                    return (
                      <div key={reservation.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                        isExpired ? 'border-red-200 bg-red-50' : 
                        isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : 
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Book Cover Placeholder */}
                            <div className="w-16 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                              <span className="text-white text-xs font-semibold text-center px-1">
                                {reservation.book?.title?.substring(0, 10) || 'Book'}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {reservation.book?.title || 'Unknown Title'}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                by {reservation.book?.author || 'Unknown Author'}
                              </p>
                              <p className="text-gray-500 text-xs mb-1">
                                <span className="font-medium">ISBN:</span> {reservation.bookIsbn}
                              </p>
                              <p className="text-gray-500 text-xs mb-1">
                                <span className="font-medium">Shelf:</span> {reservation.book?.shelfLocation || 'Unknown'}
                              </p>
                              <div className="flex items-center space-x-4 mt-3">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Reserved:</span>
                                  <span className="text-gray-600 ml-1">
                                    {reservationDate.toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Expires:</span>
                                  <span className={`ml-1 ${
                                    isExpired ? 'text-red-600 font-medium' :
                                    isExpiringSoon ? 'text-yellow-600 font-medium' :
                                    'text-gray-600'
                                  }`}>
                                    {expiryDate.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              isExpired ? 'bg-red-100 text-red-800' :
                              isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {isExpired ? 'Expired' :
                               isExpiringSoon ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}` :
                               `${daysUntilExpiry} days left`}
                            </span>
                            
                            <button
                              onClick={() => handleCancelReservation(reservation)}
                              disabled={cancelling === reservation.id}
                              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {cancelling === reservation.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                        
                        {reservation.notes && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {reservation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationsModal;