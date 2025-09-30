import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import Toast from './Toast';
import { 
  X, 
  Plus, 
  Loader2, 
  Book,
  PlusCircle
} from 'lucide-react';
import { bookService } from '../../services/bookService';

const AddCopiesModal = ({ isOpen, onClose, book, onBookUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    copiesToAdd: 1,
    reason: '',
    addedBy: ''
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

    if (!formData.copiesToAdd || formData.copiesToAdd < 1) {
      newErrors.copiesToAdd = 'Number of copies must be at least 1';
    }

    if (formData.copiesToAdd > 100) {
      newErrors.copiesToAdd = 'Cannot add more than 100 copies at once';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.addedBy.trim()) {
      newErrors.addedBy = 'Added by field is required';
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
      const addCopiesRequest = {
        copiesToAdd: parseInt(formData.copiesToAdd),
        reason: formData.reason.trim(),
        addedBy: formData.addedBy.trim()
      };
      
      const response = await bookService.addCopies(book.isbn, addCopiesRequest);
      
      if (response.success) {
        showToast(`Successfully added ${formData.copiesToAdd} copies!`, 'success');
        onBookUpdated(response.data);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        showToast('Failed to add copies: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error adding copies:', error);
      showToast('Failed to add copies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      copiesToAdd: 1,
      reason: '',
      addedBy: ''
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Add Book Copies</h2>
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
                  <span className="text-gray-300">Current: </span>
                  <span className="text-white font-medium">{book.availableCopies} available</span>
                  <span className="text-gray-400"> / {book.totalCopies} total</span>
                  <span className="ml-2 text-gray-400">Status: </span>
                  <span className="text-white font-medium">{book.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Number of Copies */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Copies to Add *
            </label>
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                value={formData.copiesToAdd}
                onChange={(e) => handleInputChange('copiesToAdd', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className={`pl-10 ${errors.copiesToAdd ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.copiesToAdd && (
              <p className="text-red-400 text-sm mt-1">{errors.copiesToAdd}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              You can add 1-100 copies at a time
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Adding *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : ''
              }`}
              placeholder="e.g., New purchase, Replacement for lost copies, Donation, etc."
            />
            {errors.reason && (
              <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Added By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Added By *
            </label>
            <Input
              type="text"
              value={formData.addedBy}
              onChange={(e) => handleInputChange('addedBy', e.target.value)}
              placeholder="Enter the name of the person adding copies"
              className={errors.addedBy ? 'border-red-500' : ''}
            />
            {errors.addedBy && (
              <p className="text-red-400 text-sm mt-1">{errors.addedBy}</p>
            )}
          </div>

          {/* Impact Preview */}
          {formData.copiesToAdd > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Impact Preview:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Available:</span>
                  <span className="text-white">{book.availableCopies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Total:</span>
                  <span className="text-white">{book.totalCopies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Copies to Add:</span>
                  <span className="text-green-400">+{formData.copiesToAdd}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1">
                  <span className="text-gray-300 font-medium">New Available:</span>
                  <span className="text-white font-medium">
                    {book.availableCopies + formData.copiesToAdd}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">New Total:</span>
                  <span className="text-white font-medium">
                    {book.totalCopies + formData.copiesToAdd}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">New Status:</span>
                  <span className="text-green-400 font-medium">Available</span>
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
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Copies...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Copies</span>
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

export default AddCopiesModal;