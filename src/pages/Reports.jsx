import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  PieChart,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('overview');

  // Mock data
  const reportStats = {
    totalReports: 24,
    scheduledReports: 8,
    customReports: 16,
    lastGenerated: '2024-01-20T10:30:00Z'
  };

  const quickStats = {
    totalUsers: 2845,
    totalBooks: 15420,
    activeLoans: 342,
    monthlyRevenue: 8750.25,
    bookUtilization: 78.5,
    userActivity: 92.3
  };

  const availableReports = [
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'Detailed analysis of user engagement and library usage patterns',
      category: 'Users',
      icon: Users,
      lastGenerated: '2024-01-20',
      frequency: 'Weekly',
      status: 'ready'
    },
    {
      id: 'book-circulation',
      name: 'Book Circulation Report',
      description: 'Comprehensive overview of book lending and return statistics',
      category: 'Books',
      icon: BookOpen,
      lastGenerated: '2024-01-19',
      frequency: 'Daily',
      status: 'ready'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue analysis including fines, payments, and outstanding amounts',
      category: 'Finance',
      icon: DollarSign,
      lastGenerated: '2024-01-18',
      frequency: 'Monthly',
      status: 'generating'
    },
    {
      id: 'overdue-analysis',
      name: 'Overdue Books Analysis',
      description: 'Tracking and analysis of overdue books and associated penalties',
      category: 'Operations',
      icon: Activity,
      lastGenerated: '2024-01-17',
      frequency: 'Weekly',
      status: 'ready'
    },
    {
      id: 'inventory-report',
      name: 'Inventory Status Report',
      description: 'Current stock levels, missing books, and acquisition recommendations',
      category: 'Inventory',
      icon: FileText,
      lastGenerated: '2024-01-16',
      frequency: 'Monthly',
      status: 'ready'
    },
    {
      id: 'usage-trends',
      name: 'Usage Trends Analysis',
      description: 'Long-term trends in library usage and seasonal patterns',
      category: 'Analytics',
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      frequency: 'Monthly',
      status: 'ready'
    }
  ];

  const chartData = {
    monthlyLoans: [
      { month: 'Jul', loans: 1150, returns: 1100 },
      { month: 'Aug', loans: 1200, returns: 1180 },
      { month: 'Sep', loans: 1350, returns: 1320 },
      { month: 'Oct', loans: 1400, returns: 1380 },
      { month: 'Nov', loans: 1250, returns: 1300 },
      { month: 'Dec', loans: 1500, returns: 1450 },
      { month: 'Jan', loans: 1650, returns: 1600 }
    ],
    categoryDistribution: [
      { category: 'Computer Science', percentage: 28, count: 4318 },
      { category: 'Mathematics', percentage: 22, count: 3392 },
      { category: 'Physics', percentage: 18, count: 2776 },
      { category: 'Chemistry', percentage: 15, count: 2313 },
      { category: 'Biology', percentage: 10, count: 1542 },
      { category: 'Others', percentage: 7, count: 1079 }
    ]
  };

  const getStatusBadge = (status) => {
    const badges = {
      ready: 'bg-green-500/20 text-green-400 border-green-500/20',
      generating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      error: 'bg-red-500/20 text-red-400 border-red-500/20'
    };
    return badges[status] || badges.ready;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Users': 'text-blue-400',
      'Books': 'text-teal-400',
      'Finance': 'text-yellow-400',
      'Operations': 'text-red-400',
      'Inventory': 'text-purple-400',
      'Analytics': 'text-green-400'
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reports & Analytics 📊</h1>
          <p className="text-gray-400 mt-1">Generate insights and track library performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Custom Report
          </Button>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Total Reports</p>
                <p className="text-lg font-bold text-gray-100">{reportStats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-blue-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Scheduled</p>
                <p className="text-lg font-bold text-gray-100">{reportStats.scheduledReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Custom Reports</p>
                <p className="text-lg font-bold text-gray-100">{reportStats.customReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Last Generated</p>
                <p className="text-sm font-bold text-gray-100">Today 10:30 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Active Users</p>
                <p className="text-2xl font-bold text-gray-100">{quickStats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-400">+12% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Book Utilization</p>
                <p className="text-2xl font-bold text-gray-100">{quickStats.bookUtilization}%</p>
              </div>
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-400">+5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-100">${quickStats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-400">+8% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Loan Trends</CardTitle>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last3months">Last 3 months</option>
                <option value="lastyear">Last year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Loan trends chart would be rendered here</p>
                <p className="text-sm text-gray-400 mt-1">Integration with Chart.js or Recharts</p>
              </div>
            </div>
            
            {/* Sample data display */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {chartData.monthlyLoans.slice(-4).map((data, index) => (
                <div key={index} className="text-center p-2 bg-slate-700 rounded">
                  <p className="text-xs text-gray-400">{data.month}</p>
                  <p className="text-sm font-bold text-teal-400">{data.loans}</p>
                  <p className="text-xs text-gray-400">Loans</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Book Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Category distribution chart</p>
                <p className="text-sm text-gray-400 mt-1">Pie chart visualization</p>
              </div>
            </div>
            
            {/* Category breakdown */}
            <div className="mt-4 space-y-2">
              {chartData.categoryDistribution.slice(0, 4).map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{category.count}</span>
                    <span className="text-sm font-medium text-teal-400">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Reports</CardTitle>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="secondary" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableReports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-teal-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-600 rounded">
                        <IconComponent className={`w-5 h-5 ${getCategoryColor(report.category)}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-100">{report.name}</h3>
                        <p className="text-xs text-gray-400">{report.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <p>Last: {report.lastGenerated}</p>
                      <p>Frequency: {report.frequency}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;