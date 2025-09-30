import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download,
  Receipt,
  Banknote,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../utils/helpers';

const Payments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [allFines, setAllFines] = useState([]);
  const [userFines, setUserFines] = useState([]);
  const [pendingFines, setPendingFines] = useState([]);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [waivingFine, setWaivingFine] = useState(null);
  const [paymentMethodStats, setPaymentMethodStats] = useState({
    CARD: { amount: 0, count: 0, trend: 0 },
    CASH: { amount: 0, count: 0, trend: 0 },
    ONLINE: { amount: 0, count: 0, trend: 0 },
    BANK_TRANSFER: { amount: 0, count: 0, trend: 0 }
  });

  useEffect(() => {
    loadPaymentData();
  }, [user]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError('');

      if (user?.role === 'STUDENT') {
        // Load student's payment data
        const [pendingResponse, outstandingResponse, historyResponse] = await Promise.all([
          paymentService.getUserPendingFines(user.id),
          paymentService.getUserOutstandingFines(user.id),
          paymentService.getUserFines(user.id, 0, 50)
        ]);

        if (pendingResponse.success) {
          const pendingData = Array.isArray(pendingResponse.data) ? pendingResponse.data : [];
          setPendingFines(pendingData);
        }

        if (outstandingResponse.success) {
          setOutstandingAmount(outstandingResponse.data || 0);
        }

        if (historyResponse.success) {
          const historyData = historyResponse.data?.content || historyResponse.data || [];
          setUserFines(Array.isArray(historyData) ? historyData : []);
          
          // Calculate payment method statistics for student
          calculatePaymentMethodStats(historyData);
        }
      } else {
        // Load all fines for librarian/admin
        const allFinesResponse = await paymentService.getAllFines(0, 100);
        if (allFinesResponse.success) {
          const finesData = allFinesResponse.data?.content || allFinesResponse.data || [];
          setAllFines(Array.isArray(finesData) ? finesData : []);
          
          // Calculate payment method statistics
          calculatePaymentMethodStats(finesData);
        }
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      setError('Failed to load payment data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const calculatePaymentMethodStats = (finesData) => {
    const stats = {
      CARD: { amount: 0, count: 0, trend: 0 },
      CASH: { amount: 0, count: 0, trend: 0 },
      ONLINE: { amount: 0, count: 0, trend: 0 },
      BANK_TRANSFER: { amount: 0, count: 0, trend: 0 }
    };

    // Ensure finesData is an array
    if (!Array.isArray(finesData)) {
      setPaymentMethodStats(stats);
      return;
    }

    // Get current month and previous month dates
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthTotals = { CARD: 0, CASH: 0, ONLINE: 0, BANK_TRANSFER: 0 };
    let previousMonthTotals = { CARD: 0, CASH: 0, ONLINE: 0, BANK_TRANSFER: 0 };

    finesData.forEach(fine => {
      if (fine && fine.status === 'PAID' && fine.payments && Array.isArray(fine.payments)) {
        fine.payments.forEach(payment => {
          if (payment && payment.paymentDate) {
            const paymentDate = new Date(payment.paymentDate);
            const method = payment.method || 'CASH';
            const amount = Number(payment.amount) || 0;

            // Add to total stats
            if (stats[method]) {
              stats[method].amount += amount;
              stats[method].count += 1;
            }

            // Calculate monthly trends
            if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
              if (currentMonthTotals[method] !== undefined) {
                currentMonthTotals[method] += amount;
              }
            } else if (paymentDate.getMonth() === previousMonth && paymentDate.getFullYear() === previousYear) {
              if (previousMonthTotals[method] !== undefined) {
                previousMonthTotals[method] += amount;
              }
            }
          }
        });
      }
    });

    // Calculate trends
    Object.keys(stats).forEach(method => {
      const current = currentMonthTotals[method] || 0;
      const previous = previousMonthTotals[method] || 0;
      if (previous > 0) {
        stats[method].trend = ((current - previous) / previous) * 100;
      } else {
        stats[method].trend = current > 0 ? 100 : 0;
      }
    });

    setPaymentMethodStats(stats);
  };

  const handleRecordPayment = () => {
    setShowRecordPaymentModal(true);
  };

  const handlePayNow = (fine) => {
    setSelectedFine(fine);
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentMethod) => {
    if (!selectedFine) return;

    setProcessingPayment(selectedFine.id);
    
    try {
      const response = await paymentService.processPayment(
        selectedFine.id,
        user.id,
        selectedFine.amount,
        paymentMethod,
        `Payment processed via ${paymentMethod.toLowerCase()}`
      );

      if (response.success) {
        alert('Payment processed successfully!');
        setShowPaymentModal(false);
        setSelectedFine(null);
        await refreshData();
      } else {
        alert('Failed to process payment: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment: ' + error.message);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleWaiveFine = async (fine, reason) => {
    setWaivingFine(fine.id);
    
    try {
      const response = await paymentService.waiveFine(
        fine.id,
        user.id,
        reason,
        'Fine waived by librarian'
      );

      if (response.success) {
        alert('Fine waived successfully!');
        setShowWaiveModal(false);
        await refreshData();
      } else {
        alert('Failed to waive fine: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error waiving fine:', error);
      alert('Failed to waive fine: ' + error.message);
    } finally {
      setWaivingFine(null);
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate stats dynamically
  const displayData = user?.role === 'STUDENT' ? userFines : allFines;
  
  const paymentStats = {
    totalFines: displayData.reduce((sum, fine) => sum + (fine.amount || 0), 0),
    paidToday: displayData.filter(fine => 
      fine.status === 'PAID' && 
      new Date(fine.updatedDate || fine.createdDate).toDateString() === new Date().toDateString()
    ).reduce((sum, fine) => sum + (fine.amount || 0), 0),
    pendingFines: displayData.filter(fine => fine.status === 'PENDING').reduce((sum, fine) => sum + (fine.amount || 0), 0),
    overduePayments: Number(outstandingAmount) || 0
  };

  const filteredPayments = displayData.filter(payment => {
    const matchesSearch = (payment.bookTitle?.toLowerCase() || payment.bookIsbn?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         payment.id?.toString().includes(searchTerm.toLowerCase()) ||
                         payment.userId?.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && payment.status === 'PAID') ||
                         (statusFilter === 'pending' && payment.status === 'PENDING') ||
                         (statusFilter === 'overdue' && payment.status === 'PENDING') ||
                         (statusFilter === 'partial' && payment.status === 'WAIVED');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'PAID': 'bg-green-500/20 text-green-400 border-green-500/20',
      'PENDING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      'WAIVED': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      'CANCELLED': 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    };
    return badges[status?.toUpperCase()] || badges.PENDING;
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'WAIVED': return <FileText className="w-4 h-4" />;
      case 'CANCELLED': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateDaysOverdue = (createdDate) => {
    if (!createdDate) return 0;
    const today = new Date();
    const created = new Date(createdDate);
    const diffTime = today - created;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
            {user?.role === 'STUDENT' ? 'My Payments & Fines 💳' : 'Fines & Payment Management 💳'}
          </h1>
          <p className="text-gray-400 mt-1">
            {user?.role === 'STUDENT' ? 'View and pay your library fines' : 'Manage library fines and payment processing'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={refreshData} disabled={refreshing} variant="secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {user?.role !== 'STUDENT' && (
            <>
              <Button onClick={handleRecordPayment}>
                <Receipt className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </>
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
              <DollarSign className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Fines</p>
                <p className="text-lg font-bold text-gray-100">${paymentStats.totalFines.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Paid Today</p>
                <p className="text-lg font-bold text-gray-100">${paymentStats.paidToday.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Pending</p>
                <p className="text-lg font-bold text-gray-100">${paymentStats.pendingFines.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Outstanding</p>
                <p className="text-lg font-bold text-gray-100">${paymentStats.overduePayments.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fines Alert for Students */}
      {user?.role === 'STUDENT' && pendingFines.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400">Action Required - Outstanding Fines</h3>
                <p className="text-gray-300 text-sm">You have {pendingFines.length} pending fine(s) totaling {formatCurrency(pendingFines.reduce((sum, fine) => sum + fine.amount, 0))}</p>
              </div>
              <Button 
                onClick={() => handlePayNow(pendingFines[0])}
                className="bg-red-500 hover:bg-red-600"
              >
                Pay Now
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
                  placeholder="Search by user name, book title, or fine ID..."
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Waived</option>
              </select>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Fines & Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fine Details
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User & Book
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date Info
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">Fine #{payment.id}</p>
                        <p className="text-xs text-gray-400">Type: {payment.type}</p>
                        <p className="text-xs text-gray-400">{payment.description}</p>
                        {payment.status === 'PENDING' && (
                          <p className="text-xs text-red-400">
                            {calculateDaysOverdue(payment.createdDate)} days old
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">User #{payment.userId}</p>
                        <p className="text-xs text-gray-400">Book: {payment.bookIsbn || 'N/A'}</p>
                        <p className="text-xs text-gray-400">Loan: {payment.loanId || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">${(payment.amount || 0).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">Created: {formatDate(payment.createdDate)}</p>
                        {payment.updatedDate && payment.updatedDate !== payment.createdDate && (
                          <p className="text-xs text-gray-400">Updated: {formatDate(payment.updatedDate)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {user?.role === 'STUDENT' && payment.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayNow(payment)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Banknote className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        )}
                        {user?.role !== 'STUDENT' && payment.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedFine(payment);
                              setShowWaiveModal(true);
                            }}
                            disabled={waivingFine === payment.id}
                            className="border-blue-300 text-blue-400 hover:bg-blue-500/10"
                          >
                            {waivingFine === payment.id ? 'Waiving...' : 'Waive'}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No payment records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedFine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-600">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Process Payment</h3>
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Fine Amount</p>
                <p className="text-2xl font-bold text-gray-100">{formatCurrency(selectedFine.amount)}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedFine.description}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Select Payment Method:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => processPayment('CASH')}
                    disabled={processingPayment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Cash
                  </Button>
                  <Button
                    onClick={() => processPayment('CARD')}
                    disabled={processingPayment}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Card
                  </Button>
                  <Button
                    onClick={() => processPayment('ONLINE')}
                    disabled={processingPayment}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Online
                  </Button>
                  <Button
                    onClick={() => processPayment('BANK_TRANSFER')}
                    disabled={processingPayment}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Bank Transfer
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedFine(null);
                }}
                disabled={processingPayment}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Fine Modal */}
      {showWaiveModal && selectedFine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-600">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Waive Fine</h3>
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Fine Amount</p>
                <p className="text-2xl font-bold text-gray-100">{formatCurrency(selectedFine.amount)}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedFine.description}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Select Waiver Reason:</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleWaiveFine(selectedFine, 'Book found in good condition')}
                    disabled={waivingFine}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Book Found
                  </Button>
                  <Button
                    onClick={() => handleWaiveFine(selectedFine, 'System error - book was returned on time')}
                    disabled={waivingFine}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    System Error
                  </Button>
                  <Button
                    onClick={() => handleWaiveFine(selectedFine, 'Special circumstances waiver')}
                    disabled={waivingFine}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Special Circumstances
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWaiveModal(false);
                  setSelectedFine(null);
                }}
                disabled={waivingFine}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-600">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Record Manual Payment</h3>
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Manual Payment Recording</p>
                    <p className="text-xs text-yellow-300 mt-1">
                      This feature allows you to record payments received outside the system (cash, check, etc.).
                      Select a pending fine from the table above and use the payment options to record digital payments.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instructions:</label>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• For digital payments: Use the "Pay" button next to each fine</li>
                    <li>• For cash payments: Use the "Pay" button and select "Cash"</li>
                    <li>• For special cases: Use the "Waive" button to waive fines</li>
                    <li>• All payments are automatically recorded with timestamps</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={() => setShowRecordPaymentModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;