import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import BookBrowsingModal from '../books/BookBrowsingModal';
import BorrowedBooksModal from './BorrowedBooksModal';
import ReservationsModal from './ReservationsModal';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    booksLoaned: 0,
    overdueBooks: 0,
    totalFines: 0,
    daysUntilDue: 0,
    activeReservations: 0
  });
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [showBorrowedModal, setShowBorrowedModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch borrowed books and reservations in parallel
      const [borrowedResponse, reservationsResponse] = await Promise.all([
        bookService.getUserActiveBorrows(user.id),
        bookService.getUserActiveReservations(user.id)
      ]);
      
      // Handle borrowed books
      if (borrowedResponse.success) {
        const books = Array.isArray(borrowedResponse.data) ? borrowedResponse.data : [];
        setBorrowedBooks(books);
        
        // Calculate stats from real data
        const now = new Date();
        let totalFines = 0;
        let overdueCount = 0;
        let nextDueDate = null;
        
        if (Array.isArray(books) && books.length > 0) {
          books.forEach(borrow => {
            if (borrow.dueDate) {
              const dueDate = new Date(borrow.dueDate);
              const diffTime = dueDate - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // If overdue
              if (diffDays < 0) {
                overdueCount++;
                // Calculate fine (assuming $1 per day overdue)
                totalFines += Math.abs(diffDays) * 1;
              } else {
                // Find next due date
                if (!nextDueDate || dueDate < nextDueDate) {
                  nextDueDate = dueDate;
                }
              }
            }
          });
        }
        
        // Calculate days until next due date
        const daysUntilDue = nextDueDate 
          ? Math.ceil((nextDueDate - now) / (1000 * 60 * 60 * 24))
          : 0;
        
        // Handle reservations
        let activeReservations = 0;
        if (reservationsResponse.success) {
          const reservationData = Array.isArray(reservationsResponse.data) ? reservationsResponse.data : [];
          setReservations(reservationData);
          activeReservations = reservationData.length;
        }
        
        setStats({
          booksLoaned: books.length,
          overdueBooks: overdueCount,
          totalFines: totalFines,
          daysUntilDue: Math.max(0, daysUntilDue),
          activeReservations: activeReservations
        });
      } else {
        setError('Failed to load borrowed books');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboardData();
  };

  const handleQuickReturn = async (borrow) => {
    if (!borrow || !user) return;
    
    const confirmReturn = window.confirm(`Are you sure you want to return "${borrow.book?.title}"?`);
    
    if (confirmReturn) {
      try {
        const response = await bookService.returnBook(user.id, borrow.book?.isbn, 'Quick return from dashboard');
        
        if (response.success) {
          alert(`Successfully returned "${borrow.book?.title}"`);
          refreshDashboard(); // Refresh the dashboard data
        } else {
          alert('Failed to return book: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error returning book:', error);
        alert('Failed to return book: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <div className="space-x-4">
          <Button onClick={() => setShowBrowseModal(true)}>
            Reserve Books
          </Button>
          <Button variant="secondary" onClick={() => setShowReservationsModal(true)}>
            My Reservations
          </Button>
          {/* <Button variant="outline" onClick={() => setShowBorrowedModal(true)}>
            My Books
          </Button> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Books Loaned</p>
              <p className="text-2xl font-bold text-blue-900">{stats.booksLoaned}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Reservations</p>
              <p className="text-2xl font-bold text-purple-900">{stats.activeReservations}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overdue Books</p>
              <p className="text-2xl font-bold text-red-900">{stats.overdueBooks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Total Fines</p>
              <p className="text-2xl font-bold text-yellow-900">${stats.totalFines.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Days Until Due</p>
              <p className="text-2xl font-bold text-green-900">{stats.daysUntilDue}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Loans */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Loans</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshDashboard}
          >
            Refresh
          </Button>
        </div>
        
        {borrowedBooks && borrowedBooks.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books borrowed</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by reserving books from our collection. A librarian will checkout the books for you.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowBrowseModal(true)}>
                Reserve Books
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(borrowedBooks) && borrowedBooks.slice(0, 3).map((borrow) => {
              const dueDate = new Date(borrow.dueDate);
              const now = new Date();
              const diffTime = dueDate - now;
              const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div key={borrow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{borrow.book?.title || 'Unknown Title'}</h3>
                      <p className="text-sm text-gray-500">{borrow.book?.author || 'Unknown Author'}</p>
                      <p className="text-sm text-gray-500">Due: {dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      daysLeft < 0 
                        ? 'bg-red-100 text-red-800' 
                        : daysLeft <= 3 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {daysLeft < 0 
                        ? `${Math.abs(daysLeft)} days overdue`
                        : `${daysLeft} days left`
                      }
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickReturn(borrow)}
                      className="min-w-[80px]"
                    >
                      Return
                    </Button>
                    {daysLeft < 0 && (
                      <Button size="sm" variant="danger" className="min-w-[80px]">
                        Pay Fine
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {Array.isArray(borrowedBooks) && borrowedBooks.length > 3 && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowBorrowedModal(true)}
                >
                  View All {borrowedBooks.length} Books
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Fines Section */}
      {stats.totalFines > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-900">Outstanding Fines</h2>
              <p className="text-sm text-red-600 mt-1">
                You have ${stats.totalFines.toFixed(2)} in overdue fines
              </p>
            </div>
            <Button variant="danger">
              Pay Fines
            </Button>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showBrowseModal && (
        <BookBrowsingModal 
          show={showBrowseModal}
          onClose={() => setShowBrowseModal(false)}
          userId={Number(user?.id)}
          onBookReserved={refreshDashboard}
        />
      )}

      {showReservationsModal && (
        <ReservationsModal 
          show={showReservationsModal}
          onClose={() => setShowReservationsModal(false)}
          userId={user?.id}
          onReservationCancelled={refreshDashboard}
        />
      )}

      {showBorrowedModal && (
        <BorrowedBooksModal 
          show={showBorrowedModal}
          onClose={() => setShowBorrowedModal(false)}
          userId={user?.id}
          onBookReturned={refreshDashboard}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
