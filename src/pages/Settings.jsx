import { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Smartphone,
  Globe,
  Lock,
  Eye,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      libraryName: 'Central University Library',
      address: '123 University Ave, College City',
      phone: '+1 (555) 123-4567',
      email: 'library@university.edu',
      timezone: 'America/New_York',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      overdueReminders: true,
      reservationAlerts: true,
      paymentConfirmations: true,
      systemAlerts: true,
      reminderDays: 3,
      maxReminders: 2
    },
    security: {
      sessionTimeout: 30,
      passwordExpiry: 90,
      requireTwoFactor: false,
      allowSelfRegistration: true,
      maxLoginAttempts: 3,
      lockoutDuration: 15
    },
    system: {
      maxLoanDuration: 14,
      maxRenewals: 2,
      finePerDay: 0.50,
      reservationDuration: 7,
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    setIsDirty(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Library Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Library Name</label>
            <Input
              value={settings.general.libraryName}
              onChange={(e) => handleSettingChange('general', 'libraryName', e.target.value)}
              placeholder="Enter library name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
            <Input
              value={settings.general.address}
              onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
              placeholder="Enter library address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <Input
                value={settings.general.phone}
                onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                value={settings.general.email}
                onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={settings.general.language}
                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Email Notifications</p>
              <p className="text-xs text-gray-400">Send notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">SMS Notifications</p>
              <p className="text-xs text-gray-400">Send notifications via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Overdue Reminders</p>
              <p className="text-xs text-gray-400">Notify users about overdue books</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.overdueReminders}
              onChange={(e) => handleSettingChange('notifications', 'overdueReminders', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Reservation Alerts</p>
              <p className="text-xs text-gray-400">Notify when reserved books are available</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.reservationAlerts}
              onChange={(e) => handleSettingChange('notifications', 'reservationAlerts', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Payment Confirmations</p>
              <p className="text-xs text-gray-400">Send payment receipt notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.paymentConfirmations}
              onChange={(e) => handleSettingChange('notifications', 'paymentConfirmations', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Days before due date to send reminder</label>
            <Input
              type="number"
              min="1"
              max="7"
              value={settings.notifications.reminderDays}
              onChange={(e) => handleSettingChange('notifications', 'reminderDays', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum number of reminders</label>
            <Input
              type="number"
              min="1"
              max="5"
              value={settings.notifications.maxReminders}
              onChange={(e) => handleSettingChange('notifications', 'maxReminders', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Authentication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
            <Input
              type="number"
              min="5"
              max="120"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Expiry (days)</label>
            <Input
              type="number"
              min="30"
              max="365"
              value={settings.security.passwordExpiry}
              onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Require Two-Factor Authentication</p>
              <p className="text-xs text-gray-400">Enhance security with 2FA</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.requireTwoFactor}
              onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Allow Self Registration</p>
              <p className="text-xs text-gray-400">Let users register themselves</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.allowSelfRegistration}
              onChange={(e) => handleSettingChange('security', 'allowSelfRegistration', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Lockout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Login Attempts</label>
            <Input
              type="number"
              min="3"
              max="10"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lockout Duration (minutes)</label>
            <Input
              type="number"
              min="5"
              max="60"
              value={settings.security.lockoutDuration}
              onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Library Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Loan Duration (days)</label>
            <Input
              type="number"
              min="7"
              max="90"
              value={settings.system.maxLoanDuration}
              onChange={(e) => handleSettingChange('system', 'maxLoanDuration', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Renewals</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={settings.system.maxRenewals}
              onChange={(e) => handleSettingChange('system', 'maxRenewals', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fine Per Day ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={settings.system.finePerDay}
              onChange={(e) => handleSettingChange('system', 'finePerDay', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reservation Duration (days)</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={settings.system.reservationDuration}
              onChange={(e) => handleSettingChange('system', 'reservationDuration', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Auto Backup</p>
              <p className="text-xs text-gray-400">Automatically backup system data</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.autoBackup}
              onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
            <select
              value={settings.system.backupFrequency}
              onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Maintenance Mode</p>
              <p className="text-xs text-gray-400">Put system in maintenance mode</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.maintenanceMode}
              onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
            <Button variant="secondary" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Restore Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'system': return renderSystemSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Settings ⚙️</h1>
          <p className="text-gray-400 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button 
            onClick={handleSave}
            disabled={!isDirty}
            className={isDirty ? '' : 'opacity-50 cursor-not-allowed'}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-slate-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-teal-500 text-teal-400 bg-slate-700/50'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      {renderTabContent()}

      {/* Save Status */}
      {isDirty && (
        <div className="fixed bottom-6 right-6">
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-3">
              <p className="text-sm text-yellow-400">You have unsaved changes</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;