import { useState, useEffect } from 'react';
import { reminderService } from '../../utils/reminderService';
import {
  Settings,
  Mail,
  Clock,
  Server,
  Database,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

const ReminderConfigModal = ({ show, onClose }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchConfig();
    }
  }, [show]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getConfig();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-xl font-bold text-gray-100 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Reminder System Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-400">Loading configuration...</p>
            </div>
          ) : config ? (
            <div className="space-y-6">
              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-4 h-4 mr-2" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Service Name</label>
                      <p className="text-gray-100 font-medium">{config.service}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Description</label>
                      <p className="text-gray-100">{config.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {config.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-100">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* API Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.endpoints && Object.entries(config.endpoints).map(([name, endpoint]) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <span className="text-gray-100 font-medium capitalize">{name}</span>
                        <code className="text-sm text-teal-400 bg-slate-600 px-2 py-1 rounded">
                          {endpoint}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                <div className="text-sm text-gray-400">
                  Configuration is read-only from the service
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={fetchConfig}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Unable to load configuration</p>
              <Button variant="secondary" className="mt-4" onClick={fetchConfig}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderConfigModal;