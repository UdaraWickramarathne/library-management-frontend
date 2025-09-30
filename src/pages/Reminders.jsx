import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reminderService, reminderUtils } from '../utils/reminderService';
import ReminderConfigModal from '../components/reminder/ReminderConfigModal';
import {
  Bell,
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Calendar,
  Play,
  RotateCcw,
  TrendingUp,
  Users,
  BookOpen,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Reminders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Fetch system health
  const fetchHealth = async () => {
    try {
      const data = await reminderService.getHealth();
      if (data.success) {
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    }
  };

  // Fetch statistics
  const fetchStats = async (days = 7) => {
    try {
      const data = await reminderService.getStatistics(days);
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch reminder logs
  const fetchLogs = async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const data = await reminderService.getLogs(page, size);
      if (data.success) {
        setLogs(data.data.content);
        setTotalPages(data.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual reminder processing
  const triggerReminders = async () => {
    try {
      setTriggering(true);
      const data = await reminderService.triggerReminders();
      if (data.success) {
        alert('Reminder processing triggered successfully!');
        setTimeout(() => {
          fetchLogs();
          fetchStats();
          fetchHealth();
        }, 2000);
      } else {
        alert('Failed to trigger reminders: ' + data.message);
      }
    } catch (error) {
      console.error('Error triggering reminders:', error);
      alert('Error triggering reminders');
    } finally {
      setTriggering(false);
    }
  };

  // Retry failed reminders
  const retryFailedReminders = async () => {
    try {
      setRetrying(true);
      const data = await reminderService.retryFailedReminders();
      if (data.success) {
        alert('Failed reminders retry triggered successfully!');
        setTimeout(() => {
          fetchLogs();
          fetchStats();
          fetchHealth();
        }, 2000);
      } else {
        alert('Failed to retry reminders: ' + data.message);
      }
    } catch (error) {
      console.error('Error retrying failed reminders:', error);
      alert('Error retrying failed reminders');
    } finally {
      setRetrying(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchHealth(),
      fetchStats(),
      fetchLogs(currentPage)
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHealth();
    fetchStats();
    fetchLogs();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-500/20 text-green-400';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DUE_TOMORROW':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Mail className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return reminderUtils.formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reminder Management 🔔</h1>
          <p className="text-gray-400 mt-1">Monitor and manage automated email reminders</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={triggerReminders} disabled={triggering}>
            <Play className="w-4 h-4 mr-2" />
            {triggering ? 'Triggering...' : 'Trigger Now'}
          </Button>
          <Button variant="secondary" onClick={retryFailedReminders} disabled={retrying}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {retrying ? 'Retrying...' : 'Retry Failed'}
          </Button>
          <Button variant="secondary" onClick={() => setShowConfig(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* System Health & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    health.status === 'UP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {health.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Service</span>
                  <span className="text-sm text-gray-100">{health.service}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Version</span>
                  <span className="text-sm text-gray-100">{health.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Last Check</span>
                  <span className="text-sm text-gray-100">{formatDate(health.timestamp)}</span>
                </div>
                
                {health.statistics && (
                  <>
                    <hr className="border-slate-600" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Total Reminders</span>
                        <span className="text-sm font-medium text-gray-100">
                          {health.statistics.totalReminders}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Last 24h</span>
                        <span className="text-sm font-medium text-gray-100">
                          {health.statistics.remindersLast24Hours}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Failed (24h)</span>
                        <span className="text-sm font-medium text-red-400">
                          {health.statistics.failedRemindersLast24Hours}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading health status...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-teal-400" />
              Statistics (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {stats.statusStatistics && Object.entries(stats.statusStatistics).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-lg font-bold text-gray-100">{count}</p>
                      <p className="text-xs text-gray-400 capitalize">{status.toLowerCase()}</p>
                    </div>
                  ))}
                </div>
                
                <hr className="border-slate-600" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Failed Reminders</span>
                    <span className="text-sm font-medium text-red-400">
                      {stats.failedReminders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Period</span>
                    <span className="text-sm text-gray-100">{stats.periodDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Generated At</span>
                    <span className="text-sm text-gray-100">{formatDate(stats.generatedAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading statistics...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reminder Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-400" />
              Recent Reminder Logs
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => currentPage > 0 && fetchLogs(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => currentPage < totalPages - 1 && fetchLogs(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-400">Loading reminder logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(log.reminderType)}
                        <span className="font-medium text-gray-100">
                          {reminderUtils.formatType(log.reminderType)} Reminder
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">User:</span> {log.userFullName} ({log.userEmail})
                        </div>
                        <div>
                          <span className="text-gray-400">Book:</span> {log.bookTitle}
                        </div>
                        <div>
                          <span className="text-gray-400">Due Date:</span> {reminderUtils.formatDateShort(log.dueDate)}
                        </div>
                        <div>
                          <span className="text-gray-400">Retry Count:</span> {log.retryCount}
                        </div>
                      </div>
                      
                      {log.errorMessage && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                          <span className="font-medium">Error:</span> {log.errorMessage}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-xs text-gray-400 ml-4">
                      <div>{formatDate(log.createdAt)}</div>
                      {log.sentAt && (
                        <div className="text-green-400">Sent: {formatDate(log.sentAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No reminder logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Configuration Modal */}
      <ReminderConfigModal 
        show={showConfig} 
        onClose={() => setShowConfig(false)} 
      />
    </div>
  );
};

export default Reminders;