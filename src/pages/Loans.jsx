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
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
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
      'ACTIVE': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      'RENEWED': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
      'OVERDUE': 'bg-red-500/20 text-red-400 border-red-500/20',
      'RETURNED': 'bg-green-500/20 text-green-400 border-green-500/20'
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {user?.role === 'STUDENT' ? 'My Loans & Borrows 📚' : 'Loan Management 📚'}
          </h1>
          <p className="text-gray-400 mt-1">
            {user?.role === 'STUDENT' ? 'View your borrowed books and loan history' : 'Manage library loans and book returns'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={refreshData} disabled={refreshing} variant="secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {user?.role === 'LIBRARIAN' && (
            <Button onClick={() => setShowCheckoutModal(true)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Create New Loan
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Loans</p>
                <p className="text-lg font-bold text-gray-100">{loanStats.totalLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Active Loans</p>
                <p className="text-lg font-bold text-gray-100">{loanStats.activeLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Overdue</p>
                <p className="text-lg font-bold text-gray-100">{loanStats.overdueLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Returned Today</p>
                <p className="text-lg font-bold text-gray-100">{loanStats.returnedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Fines Alert for Students */}
      {user?.role === 'STUDENT' && outstandingFines.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400">Action Required - Outstanding Fines</h3>
                <p className="text-gray-300 text-sm">You have {outstandingFines.length} pending fine(s) totaling ${outstandingFines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/payments'}
                className="bg-red-500 hover:bg-red-600"
              >
                Pay Fines
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
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
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="renewed">Renewed</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Records ({filteredLoans.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Book Details
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User & Dates
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-100">
                            {loan.book?.title || 'Unknown Title'}
                          </p>
                          <p className="text-xs text-gray-400">
                            ISBN: {loan.book?.isbn || loan.bookIsbn || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Loan #{loan.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100 flex items-center">
                          <User className="w-4 h-4 mr-2 text-indigo-400" />
                          {loan.user?.name || `User #${loan.userId}`}
                        </p>
                        <p className="text-xs text-gray-400">ID: {loan.userId}</p>
                        <p className="text-xs text-gray-400">
                          Issued: {formatDate(loan.issueDate || loan.borrowDate)}
                        </p>
                        {loan.renewalCount > 0 && (
                          <p className="text-xs text-yellow-400">
                            Renewed {loan.renewalCount} time(s)
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                          {formatDate(loan.dueDate)}
                        </p>
                        {isOverdue(loan) && (
                          <p className="text-xs text-red-400 font-medium mt-1">
                            {calculateDaysOverdue(loan.dueDate)} days overdue
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1">{loan.status || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {user?.role === 'LIBRARIAN' && loan.status !== 'RETURNED' && loan.status !== 'LOST' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnBook(loan)}
                              disabled={processingReturn === loan.id}
                              className="border-red-300 text-red-400 hover:bg-red-500/10"
                            >
                              {processingReturn === loan.id ? 'Processing...' : 'Return'}
                            </Button>
                            {canRenewLoan(loan) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenewLoan(loan)}
                                disabled={renewingLoan === loan.id}
                                className="border-green-300 text-green-400 hover:bg-green-500/10"
                              >
                                {renewingLoan === loan.id ? 'Renewing...' : 'Renew'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowMarkLostModal(loan)}
                              disabled={markingLost === loan.id}
                              className="border-orange-300 text-orange-400 hover:bg-orange-500/10"
                            >
                              {markingLost === loan.id ? 'Processing...' : 'Mark Lost'}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowLoanDetails(loan)}
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLoans.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No loan records found</p>
                {searchTerm && (
                  <p className="text-gray-500 text-sm mt-2">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Loan Details</h3>
              <button
                onClick={() => setShowLoanDetails(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <label className="text-sm font-medium text-blue-400">Book</label>
                <p className="text-sm text-blue-300 font-medium">{showLoanDetails.book?.title}</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-400">ISBN</label>
                <p className="text-sm text-gray-200">{showLoanDetails.book?.isbn || showLoanDetails.bookIsbn}</p>
              </div>
              <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                <label className="text-sm font-medium text-indigo-400">User ID</label>
                <p className="text-sm text-indigo-300 font-medium">{showLoanDetails.userId}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <label className="text-sm font-medium text-green-400">Issue Date</label>
                  <p className="text-sm text-green-300">{formatDate(showLoanDetails.issueDate || showLoanDetails.borrowDate)}</p>
                </div>
                <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                  <label className="text-sm font-medium text-orange-400">Due Date</label>
                  <p className="text-sm text-orange-300">{formatDate(showLoanDetails.dueDate)}</p>
                </div>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                <label className="text-sm font-medium text-purple-400">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(showLoanDetails.status)}`}>
                    {showLoanDetails.status}
                  </span>
                </div>
              </div>
              {showLoanDetails.returnDate && (
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <label className="text-sm font-medium text-green-400">Return Date</label>
                  <p className="text-sm text-green-300">{formatDate(showLoanDetails.returnDate)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={() => setShowLoanDetails(null)}
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
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Mark Book as Lost</h3>
              <button
                onClick={() => setShowMarkLostModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Warning</p>
                    <p className="text-xs text-red-300 mt-1">
                      Marking this book as lost will create a replacement fine for the user and update the book status permanently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <p className="text-sm font-medium text-blue-300">Book: {showMarkLostModal.book?.title}</p>
                <p className="text-xs text-blue-400">User: {showMarkLostModal.userId}</p>
                <p className="text-xs text-blue-400">ISBN: {showMarkLostModal.book?.isbn || showMarkLostModal.bookIsbn}</p>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Replacement Cost ($) *
                    </label>
                    <input
                      type="number"
                      name="replacementCost"
                      step="0.01"
                      min="0"
                      defaultValue="25.00"
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter replacement cost"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Optional notes about why the book is marked as lost..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
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
