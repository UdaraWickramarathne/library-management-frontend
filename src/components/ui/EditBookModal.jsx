import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import Toast from './Toast';
import { 
  X, 
  Edit3, 
  Loader2, 
  Save,
  Book
} from 'lucide-react';
import { bookService } from '../../services/bookService';

const EditBookModal = ({ isOpen, onClose, book, onBookUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationYear: '',
    genre: '',
    description: '',
    totalCopies: 1,
    shelfLocation: '',
    language: 'English',
    pages: '',
    status: 'AVAILABLE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || '',
        genre: book.genre || '',
        description: book.description || '',
        totalCopies: book.totalCopies || 1,
        shelfLocation: book.shelfLocation || '',
        language: book.language || 'English',
        pages: book.pages || '',
        status: book.status || 'AVAILABLE'
      });
    }
  }, [book]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (formData.totalCopies < book.totalCopies - book.availableCopies) {
      newErrors.totalCopies = `Total copies cannot be less than borrowed copies (${book.totalCopies - book.availableCopies})`;
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
      // Only send fields that have changed
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== book[key] && formData[key] !== '') {
          updateData[key] = formData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        showToast('No changes detected', 'warning');
        return;
      }

      const response = await bookService.updateBook(book.isbn, updateData);
      
      if (response.success) {
        showToast('Book updated successfully!', 'success');
        onBookUpdated(response.data);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast('Failed to update book: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      showToast('Failed to update book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Edit3 className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">Edit Book</h2>
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
          {/* Book Info Header */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Book className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="font-medium text-white">{book.title}</h3>
                <p className="text-sm text-gray-300">ISBN: {book.isbn}</p>
                <p className="text-sm text-gray-400">
                  Current: {book.availableCopies} available / {book.totalCopies} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author *
              </label>
              <Input
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="text-red-400 text-sm mt-1">{errors.author}</p>
              )}
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Publisher
              </label>
              <Input
                type="text"
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
              />
            </div>

            {/* Publication Year */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Publication Year
              </label>
              <Input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                min="1000"
                max="2030"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <Input
                type="text"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <Input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              />
            </div>

            {/* Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pages
              </label>
              <Input
                type="number"
                value={formData.pages}
                onChange={(e) => handleInputChange('pages', e.target.value)}
                min="1"
              />
            </div>

            {/* Total Copies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Copies *
              </label>
              <Input
                type="number"
                value={formData.totalCopies}
                onChange={(e) => handleInputChange('totalCopies', parseInt(e.target.value) || 1)}
                min={book.totalCopies - book.availableCopies} // Can't go below borrowed copies
                max="1000"
                className={errors.totalCopies ? 'border-red-500' : ''}
              />
              {errors.totalCopies && (
                <p className="text-red-400 text-sm mt-1">{errors.totalCopies}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Minimum: {book.totalCopies - book.availableCopies} (borrowed copies)
              </p>
            </div>

            {/* Shelf Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shelf Location
              </label>
              <Input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => handleInputChange('shelfLocation', e.target.value)}
                placeholder="e.g., CS-001, FICTION-A"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter book description"
              />
            </div>
          </div>

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
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Book</span>
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

export default EditBookModal;