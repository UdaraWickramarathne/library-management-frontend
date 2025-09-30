import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import  ConfirmationModal  from '../components/ui/ConfirmationModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  Search, 
  Filter, 
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Eye,
  Ban,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const RoomBookings = () => {
  const { user, USER_ROLES } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadBookings();
  }, [pagination.page]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let response;

      if (user?.role === USER_ROLES.STUDENT) {
        // Students see their own bookings
        response = await roomService.getUserBookingsPaginated(
          user.id, 
          pagination.page, 
          pagination.size
        );
      } else if (user?.role === USER_ROLES.LIBRARIAN || user?.role === USER_ROLES.ADMIN) {
        // Librarians and Admins see all bookings
        response = await roomService.getPendingBookings(
          pagination.page, 
          pagination.size
        );
      }

      if (response.success && response.data) {
        if (response.data.content) {
          // Paginated response
          setBookings(response.data.content);
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements
          }));
        } else if (Array.isArray(response.data)) {
          // Array response
          setBookings(response.data);
        } else {
          // Single booking response
          setBookings([response.data]);
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError(error.message);
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Search by room name, user name, or purpose
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.bookingDate === dateFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleBookingAction = async (booking, action) => {
    try {
      let response;
      
      switch (action) {
        case 'approve':
          response = await roomService.approveBooking(booking.id, user.id);
          showToast('Booking approved successfully', 'success');
          break;
        case 'reject':
          if (!rejectionReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
          }
          response = await roomService.rejectBooking(booking.id, user.id, {
            rejectionReason: rejectionReason
          });
          showToast('Booking rejected successfully', 'success');
          setRejectionReason('');
          break;
        case 'cancel':
          response = await roomService.cancelBooking(booking.id, user.id);
          showToast('Booking cancelled successfully', 'success');
          break;
      }
      
      setShowConfirmModal(false);
      setConfirmAction(null);
      loadBookings();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      showToast(`Failed to ${action} booking: ${error.message}`, 'error');
    }
  };

  const openConfirmModal = (booking, action) => {
    setSelectedBooking(booking);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString; // Assuming backend sends HH:mm format
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages - 1) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 0) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {user?.role === USER_ROLES.STUDENT ? 'My Room Bookings' : 'Room Bookings'}
            </h1>
            <p className="text-gray-300">
              {user?.role === USER_ROLES.STUDENT 
                ? 'Manage your room reservations'
                : 'Manage room booking requests and approvals'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={loadBookings}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => window.open('/bookings/new', '_self')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Date filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Clear filters */}
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-300">
              {filteredBookings.length} booking(s) found
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {error ? (
        <Card className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <p className="text-lg font-medium">Error loading bookings</p>
            <p className="text-sm text-gray-300 mt-2">{error}</p>
          </div>
          <Button onClick={loadBookings} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-300 mb-2">
            No bookings found
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm || statusFilter !== 'ALL' || dateFilter
              ? 'Try adjusting your filters'
              : user?.role === USER_ROLES.STUDENT 
                ? 'You haven\'t made any room bookings yet'
                : 'No booking requests available'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {booking.roomName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{booking.userName}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <span>Created: {formatDateTime(booking.createdAt)}</span>
                      </div>
                    </div>

                    {booking.purpose && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-white">Purpose:</span> {booking.purpose}
                        </p>
                      </div>
                    )}

                    {booking.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-400">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{booking.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  {booking.status === 'PENDING' && (
                    <>
                      {(user?.role === USER_ROLES.LIBRARIAN || user?.role === USER_ROLES.ADMIN) && (
                        <>
                          <Button
                            onClick={() => openConfirmModal(booking, 'approve')}
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            onClick={() => openConfirmModal(booking, 'reject')}
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                      {(user?.role === USER_ROLES.STUDENT && booking.userId === user.id) && (
                        <Button
                          onClick={() => openConfirmModal(booking, 'cancel')}
                          size="sm"
                          variant="outline"
                          className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Cancel</span>
                        </Button>
                      )}
                    </>
                  )}
                  
                  {booking.status === 'APPROVED' && user?.role === USER_ROLES.STUDENT && booking.userId === user.id && (
                    <Button
                      onClick={() => openConfirmModal(booking, 'cancel')}
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingModal(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-300">
                Showing page {pagination.page + 1} of {pagination.totalPages} 
                ({pagination.totalElements} total bookings)
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={prevPage}
                  disabled={pagination.page === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={nextPage}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBooking && confirmAction && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmAction(null);
            setRejectionReason('');
          }}
          onConfirm={() => handleBookingAction(selectedBooking, confirmAction)}
          title={`${confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)} Booking`}
          message={
            <div className="space-y-3">
              <p>
                Are you sure you want to {confirmAction} this booking for{' '}
                <span className="font-semibold">{selectedBooking.roomName}</span>?
              </p>
              
              {confirmAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
          }
          confirmText={confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)}
          cancelText="Cancel"
          confirmButtonClass={
            confirmAction === 'approve' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default RoomBookings;