import { useState } from 'react';
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
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const paymentStats = {
    totalFines: 2847.50,
    paidToday: 156.75,
    pendingFines: 892.25,
    overduePayments: 245.50
  };

  const finesAndPayments = [
    {
      id: 'F001',
      userId: 'U001',
      userName: 'Sarah Wilson',
      loanId: 'L001',
      bookTitle: 'Introduction to Algorithms',
      fineAmount: 5.50,
      reason: 'Late return',
      dueDate: '2024-01-20',
      paidAmount: 5.50,
      paidDate: '2024-01-21',
      status: 'paid',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'F002',
      userId: 'U002',
      userName: 'Michael Chen',
      loanId: 'L002',
      bookTitle: 'Calculus: Early Transcendentals',
      fineAmount: 12.75,
      reason: 'Late return',
      dueDate: '2024-01-15',
      paidAmount: 0,
      paidDate: null,
      status: 'pending',
      paymentMethod: null
    },
    {
      id: 'F003',
      userId: 'U003',
      userName: 'Emma Davis',
      loanId: 'L003',
      bookTitle: 'Organic Chemistry',
      fineAmount: 8.25,
      reason: 'Damaged book',
      dueDate: '2024-01-18',
      paidAmount: 8.25,
      paidDate: '2024-01-19',
      status: 'paid',
      paymentMethod: 'Cash'
    },
    {
      id: 'F004',
      userId: 'U004',
      userName: 'James Brown',
      loanId: 'L004',
      bookTitle: 'Physics for Engineers',
      fineAmount: 15.00,
      reason: 'Lost book (partial)',
      dueDate: '2024-01-10',
      paidAmount: 0,
      paidDate: null,
      status: 'overdue',
      paymentMethod: null
    },
    {
      id: 'F005',
      userId: 'U005',
      userName: 'Lisa Anderson',
      loanId: 'L005',
      bookTitle: 'Data Structures',
      fineAmount: 3.75,
      reason: 'Late return',
      dueDate: '2024-01-22',
      paidAmount: 3.75,
      paidDate: '2024-01-23',
      status: 'paid',
      paymentMethod: 'Online Payment'
    },
    {
      id: 'F006',
      userId: 'U006',
      userName: 'David Wilson',
      loanId: 'L006',
      bookTitle: 'Machine Learning Basics',
      fineAmount: 25.50,
      reason: 'Late return',
      dueDate: '2024-01-12',
      paidAmount: 10.00,
      paidDate: '2024-01-15',
      status: 'partial',
      paymentMethod: 'Credit Card'
    }
  ];

  const filteredPayments = finesAndPayments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/20',
      partial: 'bg-blue-500/20 text-blue-400 border-blue-500/20'
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'partial': return <CreditCard className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Fines & Payments 💳</h1>
          <p className="text-gray-400 mt-1">Manage library fines and payment processing</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button>
            <Receipt className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

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
                <p className="text-xs font-medium text-gray-400">Overdue</p>
                <p className="text-lg font-bold text-gray-100">${paymentStats.overduePayments.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <option value="partial">Partial Payment</option>
              </select>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Credit Card</p>
                <p className="text-xs text-gray-400">Most popular</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-100">$1,234.50</p>
                <p className="text-xs text-green-400">+12% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Cash</p>
                <p className="text-xs text-gray-400">Traditional</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-100">$567.25</p>
                <p className="text-xs text-red-400">-5% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Online Payment</p>
                <p className="text-xs text-gray-400">Digital</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-100">$1,045.75</p>
                <p className="text-xs text-green-400">+8% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    Payment Info
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
                        <p className="text-xs text-gray-400">Reason: {payment.reason}</p>
                        <p className="text-xs text-gray-400">Due: {payment.dueDate}</p>
                        {payment.status === 'overdue' && (
                          <p className="text-xs text-red-400">
                            {calculateDaysOverdue(payment.dueDate)} days overdue
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">{payment.userName}</p>
                        <p className="text-xs text-gray-400">User: {payment.userId}</p>
                        <p className="text-xs text-gray-400">{payment.bookTitle}</p>
                        <p className="text-xs text-gray-400">Loan: {payment.loanId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">${payment.fineAmount.toFixed(2)}</p>
                        {payment.paidAmount > 0 && (
                          <p className="text-xs text-green-400">
                            Paid: ${payment.paidAmount.toFixed(2)}
                          </p>
                        )}
                        {payment.status === 'partial' && (
                          <p className="text-xs text-red-400">
                            Remaining: ${(payment.fineAmount - payment.paidAmount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {payment.paidDate ? (
                          <>
                            <p className="text-xs text-gray-400">Paid: {payment.paidDate}</p>
                            <p className="text-xs text-gray-400">Method: {payment.paymentMethod}</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">Not paid yet</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Receipt className="w-4 h-4" />
                        </Button>
                        {payment.status !== 'paid' && (
                          <Button variant="ghost" size="sm">
                            <Banknote className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;