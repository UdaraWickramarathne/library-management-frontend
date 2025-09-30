import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Calendar, 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Filter,
  RefreshCw,
  BookOpen,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { bookService, getUserActiveBorrows, markBookAsReturned, markBookAsLost, paymentService } from '../utils/helpers';
import LibrarianCheckoutModal from '../components/dashboard/LibrarianCheckoutModal';

const Loans = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [loans, setLoans] = useState([]);
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    returnedToday: 0
  });
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(null);
  const [showMarkLostModal, setShowMarkLostModal] = useState(null);
  const [processingReturn, setProcessingReturn] = useState(null);
  const [renewingLoan, setRenewingLoan] = useState(null);
  const [markingLost, setMarkingLost] = useState(null);
  const [outstandingFines, setOutstandingFines] = useState([]);
  const [loadingFines, setLoadingFines] = useState(false);

  useEffect(() => {
    loadLoansData();
    fetchOutstandingFines();
  }, []);

  const loadLoansData = async () => {
    try {
      setLoading(true);
      setError('');

      const [allLoansResponse, overdueResponse] = await Promise.all([
        bookService.getAllBorrowRecords(0, 100),
        bookService.getOverdueBooks()
      ]);

      if (allLoansResponse.success) {
        // Handle different possible response structures
        let loansData;
        if (allLoansResponse.data?.data) {
          // If wrapped in ApiResponse with nested data
          loansData = allLoansResponse.data.data;
        } else if (allLoansResponse.data?.content) {
          // If it's a Page object with content
          loansData = allLoansResponse.data.content;
        } else if (Array.isArray(allLoansResponse.data)) {
          // If it's directly an array
          loansData = allLoansResponse.data;
        } else {
          // Fallback
          loansData = [];
        }
        
        setLoans(Array.isArray(loansData) ? loansData : []);

        // Ensure loansData is an array before filtering
        const loansArray = Array.isArray(loansData) ? loansData : [];
        
        const activeLoans = loansArray.filter(loan => 
          loan.status === 'ACTIVE' || loan.status === 'RENEWED'
        ).length;
        
        const overdueLoans = overdueResponse.success ? 
          (Array.isArray(overdueResponse.data?.data || overdueResponse.data) ? 
           (overdueResponse.data?.data || overdueResponse.data).length : 0) : 0;

        // Calculate returned today
        const today = new Date().toISOString().split('T')[0];
        const returnedToday = loansArray.filter(loan => 
          loan.returnDate && loan.returnDate.startsWith(today)
        ).length;

        setLoanStats({
          totalLoans: loansArray.length,
          activeLoans: activeLoans,
          overdueLoans: overdueLoans,
          returnedToday: returnedToday
        });
      } else {
        setError('Failed to load loans data');
        setLoans([]);
      }
    } catch (error) {
      console.error('Error loading loans data:', error);
      setError('Failed to load loans data: ' + error.message);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      loadLoansData(),
      fetchOutstandingFines()
    ]);
    setRefreshing(false);
  };

  const handleReturnBook = async (loan) => {
    if (!loan.userId || !loan.bookIsbn) {
      alert('Invalid loan data');
      return;
    }

    const confirmReturn = window.confirm(
      `Confirm return of "${loan.book?.title}" by user ${loan.userId}?`
    );
    
    if (!confirmReturn) return;

    setProcessingReturn(loan.id);
    
    try {
      const response = await bookService.returnBook(
        loan.userId, 
        loan.bookIsbn, 
        'Returned via loan management'
      );

      if (response.success) {
        alert('Book returned successfully');
        await refreshData();
      } else {
        alert('Failed to return book: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book: ' + error.message);
    } finally {
      setProcessingReturn(null);
    }
  };

  const handleRenewLoan = async (loan) => {
    if (!loan.id || !loan.userId) {
      alert('Invalid loan data');
      return;
    }

    const confirmRenewal = window.confirm(
      `Confirm renewal of "${loan.book?.title}" for user ${loan.userId}?`
    );
    
    if (!confirmRenewal) return;

    setRenewingLoan(loan.id);
    
    try {
      const response = await bookService.renewLoan(
        loan.userId, 
        loan.id, 
        'Renewed via loan management'
      );

      if (response.success) {
        alert('Loan renewed successfully');
        await refreshData();
      } else {
        alert('Failed to renew loan: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error renewing loan:', error);
      alert('Failed to renew loan: ' + error.message);
    } finally {
      setRenewingLoan(null);
    }
  };

  // Fetch outstanding fines for students
  const fetchOutstandingFines = async () => {
    if (user?.role !== 'STUDENT') return;
    
    setLoadingFines(true);
    try {
      const response = await paymentService.getUserFines(user.id);
      if (response.success) {
        const fines = response.data || [];
        const outstanding = fines.filter(fine => fine.status === 'PENDING');
        setOutstandingFines(outstanding);
      } else {
        console.error('Failed to fetch fines:', response.message);
        setOutstandingFines([]);
      }
    } catch (error) {
      console.error('Error fetching outstanding fines:', error);
      setOutstandingFines([]);
    } finally {
      setLoadingFines(false);
    }
  };

  const handleMarkAsLost = async (loan, replacementCost, notes) => {
    setMarkingLost(true);
    try {
      await markBookAsLost(loan.id, user.id, replacementCost, notes);
      
      // Update loans list and fines after marking as lost
      await Promise.all([
        loadLoansData(),
        fetchOutstandingFines()
      ]);
      setShowMarkLostModal(null);
      
      // You could add a success notification here
      alert('Book marked as lost successfully. A replacement fine has been created for the user.');
    } catch (error) {
      console.error('Error marking book as lost:', error);
      alert('Failed to mark book as lost. Please try again.');
    } finally {
      setMarkingLost(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const searchFields = [
      loan.book?.title,
      loan.book?.isbn,
      loan.userId,
      loan.id?.toString()
    ].filter(Boolean).map(field => String(field).toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
      searchFields.some(field => field.includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': 'bg-blue-100 text-blue-800 border border-blue-200',
      'RENEWED': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'OVERDUE': 'bg-red-100 text-red-800 border border-red-200',
      'RETURNED': 'bg-green-100 text-green-800 border border-green-200'
    };
    return badges[status?.toUpperCase()] || badges.ACTIVE;
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'RENEWED':
        return <Clock className="w-4 h-4" />;
      case 'OVERDUE': 
        return <AlertTriangle className="w-4 h-4" />;
      case 'RETURNED': 
        return <CheckCircle className="w-4 h-4" />;
      default: 
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isOverdue = (loan) => {
    if (loan.status?.toUpperCase() === 'RETURNED') return false;
    return calculateDaysOverdue(loan.dueDate) > 0;
  };

  const canRenewLoan = (loan) => {
    if (loan.status?.toUpperCase() === 'RETURNED') return false;
    if (loan.status?.toUpperCase() === 'OVERDUE') return false;
    return (loan.renewalCount || 0) < 2;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
        <div className="flex gap-2">
          {user?.role === 'LIBRARIAN' && (
            <Button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create New Loan
            </Button>
          )}
          <Button
            onClick={refreshData}
            variant="outline"
            disabled={refreshing}
            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loanStats.totalLoans}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loanStats.activeLoans}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{loanStats.overdueLoans}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Returned Today</p>
                <p className="text-2xl font-bold text-gray-900">{loanStats.returnedToday}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Outstanding Fines Alert for Students */}
      {user?.role === 'STUDENT' && outstandingFines.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-800 mb-2">Outstanding Fines</h3>
                <p className="text-sm text-orange-700 mb-3">
                  You have {outstandingFines.length} unpaid fine{outstandingFines.length > 1 ? 's' : ''} totaling ${outstandingFines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}.
                </p>
                <div className="space-y-2">
                  {outstandingFines.slice(0, 3).map((fine) => (
                    <div key={fine.id} className="bg-white bg-opacity-50 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-orange-900">
                          {fine.type} - ${fine.amount.toFixed(2)}
                        </span>
                        <span className="text-orange-600">
                          {fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      {fine.description && (
                        <p className="text-orange-700 mt-1">{fine.description}</p>
                      )}
                    </div>
                  ))}
                  {outstandingFines.length > 3 && (
                    <p className="text-xs text-orange-600 font-medium">
                      ... and {outstandingFines.length - 3} more fine{outstandingFines.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => window.location.href = '/payments'}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    Pay Fines
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={fetchOutstandingFines}
                    disabled={loadingFines}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs"
                  >
                    {loadingFines ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by book title, ISBN, user ID, or loan ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="renewed">Renewed</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Loan Records ({filteredLoans.length})
          </h2>
        </div>
        <div className="overflow-x-auto bg-gray-50">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-blue-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.book?.title || 'Unknown Title'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ISBN: {loan.book?.isbn || loan.bookIsbn || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-indigo-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {loan.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-green-500 mr-2" />
                      {formatDate(loan.issueDate || loan.borrowDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                      {formatDate(loan.dueDate)}
                      {isOverdue(loan) && (
                        <span className="ml-2 text-red-600 text-xs font-medium bg-red-100 px-2 py-1 rounded-full">
                          ({calculateDaysOverdue(loan.dueDate)} days overdue)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      <span className="ml-1">{loan.status || 'Unknown'}</span>
                    </span>
                    {loan.renewalCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Renewed {loan.renewalCount} time(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user?.role === 'LIBRARIAN' && loan.status !== 'RETURNED' && loan.status !== 'LOST' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturnBook(loan)}
                            disabled={processingReturn === loan.id}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 disabled:opacity-50"
                          >
                            {processingReturn === loan.id ? 'Processing...' : 'Return'}
                          </Button>
                          {canRenewLoan(loan) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenewLoan(loan)}
                              disabled={renewingLoan === loan.id}
                              className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 disabled:opacity-50"
                            >
                              {renewingLoan === loan.id ? 'Renewing...' : 'Renew'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowMarkLostModal(loan)}
                            disabled={markingLost === loan.id}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50"
                          >
                            {markingLost === loan.id ? 'Processing...' : 'Mark Lost'}
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowLoanDetails(loan)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      >
                        View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50">
              <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No loan records found</p>
              {searchTerm && (
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {showCheckoutModal && (
        <LibrarianCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={refreshData}
          librarianId={user?.id}
        />
      )}

      {showLoanDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Loan Details</h3>
              <button
                onClick={() => setShowLoanDetails(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-blue-800">Book</label>
                <p className="text-sm text-blue-900 font-medium">{showLoanDetails.book?.title}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-600">ISBN</label>
                <p className="text-sm text-gray-900">{showLoanDetails.book?.isbn || showLoanDetails.bookIsbn}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-indigo-800">User ID</label>
                <p className="text-sm text-indigo-900 font-medium">{showLoanDetails.userId}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-green-800">Issue Date</label>
                  <p className="text-sm text-green-900">{formatDate(showLoanDetails.issueDate || showLoanDetails.borrowDate)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-orange-800">Due Date</label>
                  <p className="text-sm text-orange-900">{formatDate(showLoanDetails.dueDate)}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-purple-800">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(showLoanDetails.status)}`}>
                    {showLoanDetails.status}
                  </span>
                </div>
              </div>
              {showLoanDetails.returnDate && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-green-800">Return Date</label>
                  <p className="text-sm text-green-900">{formatDate(showLoanDetails.returnDate)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowLoanDetails(null)}
                className="bg-gray-50 hover:bg-gray-100 border-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Lost Modal */}
      {showMarkLostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mark Book as Lost</h3>
              <button
                onClick={() => setShowMarkLostModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Warning</p>
                    <p className="text-xs text-red-700 mt-1">
                      Marking this book as lost will create a replacement fine for the user and update the book status permanently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Book: {showMarkLostModal.book?.title}</p>
                <p className="text-xs text-blue-700">User: {showMarkLostModal.userId}</p>
                <p className="text-xs text-blue-700">ISBN: {showMarkLostModal.book?.isbn || showMarkLostModal.bookIsbn}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const replacementCost = parseFloat(formData.get('replacementCost'));
                const notes = formData.get('notes');
                handleMarkAsLost(showMarkLostModal, replacementCost, notes);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replacement Cost ($) *
                    </label>
                    <input
                      type="number"
                      name="replacementCost"
                      step="0.01"
                      min="0"
                      defaultValue="25.00"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter replacement cost"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Optional notes about why the book is marked as lost..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMarkLostModal(null)}
                      disabled={markingLost}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={markingLost}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {markingLost ? 'Processing...' : 'Mark as Lost'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
