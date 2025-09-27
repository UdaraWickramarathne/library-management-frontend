import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck,
  Trash2,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const notificationStats = {
    total: 47,
    unread: 12,
    urgent: 3,
    todayCount: 8
  };

  const notifications = [
    {
      id: 'N001',
      type: 'overdue',
      title: 'Book Return Overdue',
      message: 'Sarah Wilson has an overdue book: "Introduction to Algorithms" (Due: Jan 15, 2024)',
      timestamp: '2024-01-20T10:30:00Z',
      isRead: false,
      priority: 'high',
      userId: 'U001',
      relatedId: 'L001',
      actionRequired: true
    },
    {
      id: 'N002',
      type: 'payment',
      title: 'Fine Payment Received',
      message: 'Michael Chen paid $5.50 fine for late return (Payment ID: P123)',
      timestamp: '2024-01-20T09:15:00Z',
      isRead: true,
      priority: 'low',
      userId: 'U002',
      relatedId: 'P123',
      actionRequired: false
    },
    {
      id: 'N003',
      type: 'system',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for Jan 22, 2024 from 2:00 AM to 4:00 AM EST',
      timestamp: '2024-01-19T16:00:00Z',
      isRead: false,
      priority: 'medium',
      userId: null,
      relatedId: null,
      actionRequired: false
    },
    {
      id: 'N004',
      type: 'reservation',
      title: 'Book Reservation Ready',
      message: 'Reserved book "Calculus: Early Transcendentals" is now available for Emma Davis',
      timestamp: '2024-01-19T14:20:00Z',
      isRead: true,
      priority: 'medium',
      userId: 'U003',
      relatedId: 'R001',
      actionRequired: true
    },
    {
      id: 'N005',
      type: 'user',
      title: 'New User Registration',
      message: 'James Brown (Student ID: STU001) has registered and pending approval',
      timestamp: '2024-01-19T11:45:00Z',
      isRead: false,
      priority: 'high',
      userId: 'U004',
      relatedId: null,
      actionRequired: true
    },
    {
      id: 'N006',
      type: 'reminder',
      title: 'Return Reminder',
      message: 'Lisa Anderson has 2 books due tomorrow (Jan 21, 2024)',
      timestamp: '2024-01-19T08:00:00Z',
      isRead: true,
      priority: 'low',
      userId: 'U005',
      relatedId: 'L005',
      actionRequired: false
    },
    {
      id: 'N007',
      type: 'fine',
      title: 'Fine Generated',
      message: 'Late return fine of $12.75 generated for David Wilson (Loan ID: L006)',
      timestamp: '2024-01-18T17:30:00Z',
      isRead: false,
      priority: 'medium',
      userId: 'U006',
      relatedId: 'L006',
      actionRequired: true
    },
    {
      id: 'N008',
      type: 'book',
      title: 'New Books Added',
      message: '15 new Computer Science books have been added to the catalog',
      timestamp: '2024-01-18T10:00:00Z',
      isRead: true,
      priority: 'low',
      userId: null,
      relatedId: null,
      actionRequired: false
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.isRead) ||
                         (statusFilter === 'unread' && !notification.isRead);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      overdue: <AlertTriangle className="w-5 h-5 text-red-400" />,
      payment: <CheckCircle className="w-5 h-5 text-green-400" />,
      system: <Settings className="w-5 h-5 text-blue-400" />,
      reservation: <BookOpen className="w-5 h-5 text-teal-400" />,
      user: <Mail className="w-5 h-5 text-purple-400" />,
      reminder: <Clock className="w-5 h-5 text-yellow-400" />,
      fine: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      book: <BookOpen className="w-5 h-5 text-teal-400" />
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-400" />;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-500/20 text-red-400 border-red-500/20',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      low: 'bg-green-500/20 text-green-400 border-green-500/20'
    };
    return badges[priority] || badges.low;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Notifications 🔔</h1>
          <p className="text-gray-400 mt-1">Stay updated with library activities and alerts</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total</p>
                <p className="text-lg font-bold text-gray-100">{notificationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Unread</p>
                <p className="text-lg font-bold text-gray-100">{notificationStats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Urgent</p>
                <p className="text-lg font-bold text-gray-100">{notificationStats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Today</p>
                <p className="text-lg font-bold text-gray-100">{notificationStats.todayCount}</p>
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
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="overdue">Overdue</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="reservation">Reservation</option>
                <option value="user">User</option>
                <option value="reminder">Reminder</option>
                <option value="fine">Fine</option>
                <option value="book">Book</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className={`transition-colors ${!notification.isRead ? 'bg-slate-700/50 border-teal-500/20' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-teal-500/20' : 'bg-slate-600'}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-100' : 'text-gray-200'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {notification.userId && (
                          <span>User: {notification.userId}</span>
                        )}
                        {notification.relatedId && (
                          <span>ID: {notification.relatedId}</span>
                        )}
                        {notification.actionRequired && (
                          <span className="text-yellow-400">Action Required</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 ml-4">
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm">
                          <CheckCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">No notifications found</h3>
              <p className="text-gray-400">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'re all caught up! No new notifications at the moment.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;