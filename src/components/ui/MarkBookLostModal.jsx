import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import Toast from './Toast';
import { 
  X, 
  AlertTriangle, 
  Loader2, 
  Book,
  Minus
} from 'lucide-react';
import { bookService } from '../../services/bookService';

const MarkBookLostModal = ({ isOpen, onClose, book, onBookUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    copiesToMarkLost: 1,
    reason: '',
    reportedBy: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.copiesToMarkLost || formData.copiesToMarkLost < 1) {
      newErrors.copiesToMarkLost = 'Number of copies must be at least 1';
    }

    if (formData.copiesToMarkLost > book.availableCopies) {
      newErrors.copiesToMarkLost = `Cannot mark more than ${book.availableCopies} available copies as lost`;
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Reported by field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await bookService.markBookAsLost(book.isbn, {
        copiesToMarkLost: parseInt(formData.copiesToMarkLost),
        reason: formData.reason.trim(),
        reportedBy: formData.reportedBy.trim()
      });
      
      if (response.success) {
        showToast('Book copies marked as lost successfully!', 'success');
        onBookUpdated(response.data);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        showToast('Failed to mark book as lost: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error marking book as lost:', error);
      showToast('Failed to mark book as lost', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      copiesToMarkLost: 1,
      reason: '',
      reportedBy: ''
    });
    setErrors({});
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen || !book) return null;

  const maxCopies = book.availableCopies;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Mark Book as Lost</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Book Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Book className="w-5 h-5 text-teal-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">{book.title}</h3>
                <p className="text-sm text-gray-300">by {book.author}</p>
                <p className="text-sm text-gray-400">ISBN: {book.isbn}</p>
                <div className="mt-2 text-sm">
                  <span className="text-gray-300">Available Copies: </span>
                  <span className="text-white font-medium">{book.availableCopies}</span>
                  <span className="text-gray-400"> / {book.totalCopies} total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-400 font-medium">Warning</h4>
                <p className="text-red-300 text-sm mt-1">
                  This action will reduce the available copies of this book. 
                  This action cannot be easily undone.
                </p>
              </div>
            </div>
          </div>

          {/* Number of Copies */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Copies to Mark as Lost *
            </label>
            <div className="relative">
              <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                value={formData.copiesToMarkLost}
                onChange={(e) => handleInputChange('copiesToMarkLost', parseInt(e.target.value) || 1)}
                min="1"
                max={maxCopies}
                className={`pl-10 ${errors.copiesToMarkLost ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.copiesToMarkLost && (
              <p className="text-red-400 text-sm mt-1">{errors.copiesToMarkLost}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Maximum: {maxCopies} (available copies only)
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Loss *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Damaged beyond repair, Stolen, Water damage, etc."
            />
            {errors.reason && (
              <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reported By *
            </label>
            <Input
              type="text"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange('reportedBy', e.target.value)}
              placeholder="Enter the name of the person reporting the loss"
              className={errors.reportedBy ? 'border-red-500' : ''}
            />
            {errors.reportedBy && (
              <p className="text-red-400 text-sm mt-1">{errors.reportedBy}</p>
            )}
          </div>

          {/* Impact Preview */}
          {formData.copiesToMarkLost > 0 && formData.copiesToMarkLost <= maxCopies && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Impact Preview:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Available:</span>
                  <span className="text-white">{book.availableCopies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Copies to Mark Lost:</span>
                  <span className="text-red-400">-{formData.copiesToMarkLost}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1">
                  <span className="text-gray-300 font-medium">New Available:</span>
                  <span className="text-white font-medium">
                    {book.availableCopies - formData.copiesToMarkLost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">New Total:</span>
                  <span className="text-white">
                    {book.totalCopies - formData.copiesToMarkLost}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || maxCopies === 0}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Marking as Lost...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Mark as Lost</span>
                </>
              )}
            </Button>
          </div>
          </form>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MarkBookLostModal;