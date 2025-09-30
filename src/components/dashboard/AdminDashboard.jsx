import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Calendar,
  UserPlus,
  Settings,
  Mail,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

const AdminDashboard = () => {
  // Mock data
  const stats = {
    totalUsers: 2845,
    totalBooks: 15420,
    activeLoans: 342,
    revenue: 8750.25,
    monthlyGrowth: 12.5,
    systemUptime: 99.9
  };

  // Mock reminder stats
  const reminderStats = {
    totalSent: 156,
    sentToday: 23,
    failed: 5,
    status: 'UP'
  };

  const recentUsers = [
    {
      id: 1,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      role: 'Student',
      joinDate: '2024-01-10',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'Faculty',
      joinDate: '2024-01-09',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      role: 'Student',
      joinDate: '2024-01-08',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    }
  ];

  const systemHealth = [
    { metric: 'Database', status: 'healthy', value: '99.9%', color: 'text-green-400' },
    { metric: 'API Response', status: 'healthy', value: '145ms', color: 'text-green-400' },
    { metric: 'Email Service', status: 'warning', value: '85%', color: 'text-yellow-400' },
    { metric: 'Backup System', status: 'healthy', value: 'Complete', color: 'text-green-400' }
  ];

  const topBooks = [
    { title: 'Introduction to Algorithms', category: 'Computer Science', loans: 156 },
    { title: 'Calculus: Early Transcendentals', category: 'Mathematics', loans: 134 },
    { title: 'Organic Chemistry', category: 'Chemistry', loans: 128 },
    { title: 'Physics for Engineers', category: 'Physics', loans: 121 }
  ];

  const monthlyStats = [
    { month: 'Oct', loans: 1200, fines: 450 },
    { month: 'Nov', loans: 1350, fines: 380 },
    { month: 'Dec', loans: 1500, fines: 520 },
    { month: 'Jan', loans: 1650, fines: 420 }
  ];

  const alerts = [
    {
      id: 1,
      type: 'system',
      message: 'Scheduled maintenance in 2 days',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'user',
      message: '15 new user registrations pending approval',
      time: '4 hours ago',
      priority: 'high'
    },
    {
      id: 3,
      type: 'financial',
      message: 'Monthly fine collection target achieved',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Admin Management Panel 🛠️</h1>
          <p className="text-gray-400 mt-1">System overview and administrative controls</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Users</p>
                <p className="text-lg font-bold text-gray-100">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Activity className="w-6 h-6 text-green-400" />
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
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Revenue</p>
                <p className="text-lg font-bold text-gray-100">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Growth</p>
                <p className="text-lg font-bold text-gray-100">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Uptime</p>
                <p className="text-lg font-bold text-gray-100">{stats.systemUptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart Placeholder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <BarChart3 className="w-5 h-5 inline mr-2" />
                  Monthly Analytics
                </CardTitle>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Analytics chart would be rendered here</p>
                  <p className="text-sm text-gray-400 mt-1">Integration with Chart.js or Recharts</p>
                </div>
              </div>
              
              {/* Sample Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-slate-700 rounded-lg">
                    <p className="text-xs text-gray-400">{stat.month}</p>
                    <p className="text-sm font-bold text-gray-100">{stat.loans}</p>
                    <p className="text-xs text-yellow-400">${stat.fines}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent User Registrations</CardTitle>
                <Button variant="ghost" size="sm">Manage Users</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'Faculty' 
                          ? 'bg-primary-500/20 text-teal-400'
                          : 'bg-teal-400/20 text-teal-400'
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{user.joinDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemHealth.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.metric}</span>
                    <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Books */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topBooks.map((book, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-100">{book.title}</p>
                      <span className="text-xs text-yellow-400 font-bold">{book.loans}</span>
                    </div>
                    <p className="text-xs text-gray-400">{book.category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.priority === 'high' 
                      ? 'bg-red-500/10 border-red-500/20'
                      : alert.priority === 'medium'
                      ? 'bg-yellow-500/10 border-accent-yellow/20'
                      : 'bg-primary-500/10 border-primary-500/20'
                  }`}>
                    <p className="text-xs text-gray-100">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Reminders Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                Email Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">System Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminderStats.status === 'UP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {reminderStats.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-100">{reminderStats.totalSent}</p>
                    <p className="text-xs text-gray-400">Total Sent</p>
                  </div>
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="flex items-center justify-center mb-1">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-100">{reminderStats.sentToday}</p>
                    <p className="text-xs text-gray-400">Today</p>
                  </div>
                </div>
                {reminderStats.failed > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <span className="text-xs text-red-400">Failed Reminders</span>
                    <span className="text-xs font-medium text-red-400">{reminderStats.failed}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
