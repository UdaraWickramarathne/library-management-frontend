import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDestructive = false,
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              {isDestructive && (
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              )}
              <CardTitle className={isDestructive ? 'text-red-400' : ''}>{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-6">{message}</p>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className={`flex-1 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : ''}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmationModal;