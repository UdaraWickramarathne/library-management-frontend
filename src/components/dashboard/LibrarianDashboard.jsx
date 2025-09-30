import { 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Calendar,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LibrarianCheckoutModal from './LibrarianCheckoutModal';

const LibrarianDashboard = () => {
  const { user } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  // Mock data
  const stats = {
    totalBooks: 15420,
    activeLoans: 342,
    overdueLoans: 28,
    todayReturns: 45,
    totalFines: 1250.75,
    newMembers: 12
  };

  const recentActivities = [
    {
      id: 1,
      type: 'checkout',
      user: 'Alice Johnson',
      book: 'The Clean Coder',
      time: '10 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 2,
      type: 'return',
      user: 'Bob Smith',
      book: 'JavaScript Patterns',
      time: '25 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 3,
      type: 'overdue',
      user: 'Carol Davis',
      book: 'Design Patterns',
      time: '1 hour ago',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 4,
      type: 'fine_paid',
      user: 'David Wilson',
      book: 'Clean Architecture',
      amount: 5.50,
      time: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    }
  ];

  const dueTodayLoans = [
    {
      id: 1,
      user: 'Emma Thompson',
      book: 'Effective Java',
      userId: 'ST001',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      user: 'James Brown',
      book: 'Head First Design Patterns',
      userId: 'ST002',
      phone: '+1 (555) 987-6543'
    }
  ];

  const popularBooks = [
    { title: 'Clean Code', loans: 45, available: 2 },
    { title: 'The Pragmatic Programmer', loans: 38, available: 1 },
    { title: 'JavaScript: The Good Parts', loans: 32, available: 0 },
    { title: 'Design Patterns', loans: 29, available: 3 }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'checkout':
        return <BookOpen className="w-4 h-4 text-teal-400" />;
      case 'return':
        return <BookOpen className="w-4 h-4 text-green-400" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'fine_paid':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'checkout':
        return `${activity.user} checked out "${activity.book}"`;
      case 'return':
        return `${activity.user} returned "${activity.book}"`;
      case 'overdue':
        return `"${activity.book}" is overdue for ${activity.user}`;
      case 'fine_paid':
        return `${activity.user} paid $${activity.amount} fine for "${activity.book}"`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Librarian Management Panel 📚</h1>
          <p className="text-gray-400 mt-1">Manage books, loans, and library operations</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={() => setShowCheckoutModal(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Checkout Book
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
          <Button variant="secondary">
            <Search className="w-4 h-4 mr-2" />
            Quick Search
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Books</p>
                <p className="text-lg font-bold text-gray-100">{stats.totalBooks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Active Loans</p>
                <p className="text-lg font-bold text-gray-100">{stats.activeLoans}</p>
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
                <p className="text-lg font-bold text-gray-100">{stats.overdueLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Due Today</p>
                <p className="text-lg font-bold text-gray-100">{stats.todayReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Fines</p>
                <p className="text-lg font-bold text-gray-100">${stats.totalFines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">New Members</p>
                <p className="text-lg font-bold text-gray-100">{stats.newMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 bg-slate-700 rounded-lg">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-100">{getActivityText(activity)}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                    <div className="ml-3">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Due Today */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Books Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dueTodayLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-accent-yellow/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-100">{loan.book}</p>
                      <p className="text-sm text-gray-400">
                        {loan.user} ({loan.userId}) • {loan.phone}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">Call</Button>
                      <Button size="sm">Extend</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Books */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Books This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularBooks.map((book, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-100">{book.title}</p>
                      <p className="text-xs text-gray-400">{book.loans} loans</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.available === 0 
                        ? 'bg-red-500/20 text-red-400'
                        : book.available <= 2
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {book.available} available
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setShowCheckoutModal(true)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Checkout Book (Create Loan)
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Return Book
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Book
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Register Member
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Overdue Report
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Reminders
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-400">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 font-medium">Low Stock Alert</p>
                  <p className="text-xs text-gray-400 mt-1">
                    3 popular books have less than 2 copies available
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-accent-yellow/20 rounded-lg">
                  <p className="text-xs text-yellow-400 font-medium">Reminder System</p>
                  <p className="text-xs text-gray-400 mt-1">
                    28 overdue reminders sent today
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400 font-medium">Email Service</p>
                  <p className="text-xs text-gray-400 mt-1">
                    All reminder emails delivered successfully
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <LibrarianCheckoutModal 
          show={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          librarianId={user?.id}
          onLoanCreated={() => {
            // Refresh dashboard data if needed
            console.log('Loan created successfully');
          }}
        />
      )}
    </div>
  );
};

export default LibrarianDashboard;
