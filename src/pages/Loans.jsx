import { useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  RotateCcw,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Loans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const loanStats = {
    totalLoans: 1247,
    activeLoans: 342,
    overdueLoans: 28,
    returnedToday: 15
  };

  const loans = [
    {
      id: 'L001',
      bookTitle: 'Introduction to Algorithms',
      bookId: 'B001',
      userName: 'Sarah Wilson',
      userId: 'U001',
      issueDate: '2024-01-10',
      dueDate: '2024-01-24',
      returnDate: null,
      status: 'active',
      fine: 0,
      renewalCount: 1
    },
    {
      id: 'L002',
      bookTitle: 'Calculus: Early Transcendentals',
      bookId: 'B002',
      userName: 'Michael Chen',
      userId: 'U002',
      issueDate: '2024-01-05',
      dueDate: '2024-01-19',
      returnDate: null,
      status: 'overdue',
      fine: 5.50,
      renewalCount: 0
    },
    {
      id: 'L003',
      bookTitle: 'Organic Chemistry',
      bookId: 'B003',
      userName: 'Emma Davis',
      userId: 'U003',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      returnDate: '2024-01-14',
      status: 'returned',
      fine: 0,
      renewalCount: 0
    },
    {
      id: 'L004',
      bookTitle: 'Physics for Engineers',
      bookId: 'B004',
      userName: 'James Brown',
      userId: 'U004',
      issueDate: '2024-01-08',
      dueDate: '2024-01-22',
      returnDate: null,
      status: 'active',
      fine: 0,
      renewalCount: 2
    },
    {
      id: 'L005',
      bookTitle: 'Data Structures and Algorithms',
      bookId: 'B005',
      userName: 'Lisa Anderson',
      userId: 'U005',
      issueDate: '2023-12-20',
      dueDate: '2024-01-03',
      returnDate: null,
      status: 'overdue',
      fine: 12.75,
      renewalCount: 0
    }
  ];

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/20',
      returned: 'bg-green-500/20 text-green-400 border-green-500/20'
    };
    return badges[status] || badges.active;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
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
          <h1 className="text-2xl font-bold text-gray-100">Loan Management 📚</h1>
          <p className="text-gray-400 mt-1">Manage book loans and returns</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Issue New Loan
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
              <Clock className="w-6 h-6 text-blue-400" />
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by book title, user name, or loan ID..."
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

      {/* Loans Table */}
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
                    Loan Details
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fine
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
                      <div>
                        <p className="text-sm font-medium text-gray-100">{loan.bookTitle}</p>
                        <p className="text-xs text-gray-400">ID: {loan.id} • Book: {loan.bookId}</p>
                        {loan.renewalCount > 0 && (
                          <p className="text-xs text-yellow-400">Renewed {loan.renewalCount} time(s)</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-100">{loan.userName}</p>
                        <p className="text-xs text-gray-400">ID: {loan.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">Issued: {loan.issueDate}</p>
                        <p className="text-xs text-gray-400">Due: {loan.dueDate}</p>
                        {loan.returnDate && (
                          <p className="text-xs text-green-400">Returned: {loan.returnDate}</p>
                        )}
                        {loan.status === 'overdue' && (
                          <p className="text-xs text-red-400">
                            {calculateDaysOverdue(loan.dueDate)} days overdue
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1 capitalize">{loan.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${loan.fine > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        ${loan.fine.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {loan.status === 'active' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
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

export default Loans;