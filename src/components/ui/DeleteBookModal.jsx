import React, { useState } from 'react';
import { Button } from './Button';
import Toast from './Toast';
import { 
  X, 
  Trash2, 
  Loader2, 
  Book,
  AlertTriangle
} from 'lucide-react';
import { bookService } from '../../services/bookService';

const DeleteBookModal = ({ isOpen, onClose, book, onBookDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const expectedConfirmText = book?.title || '';
  const isConfirmed = confirmText === expectedConfirmText;

  const handleDelete = async () => {
    if (!isConfirmed) {
      showToast('Please type the book title to confirm deletion', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await bookService.deleteBook(book.isbn);
      
      if (response.success) {
        showToast('Book deleted successfully!', 'success');
        onBookDeleted(book);
        setTimeout(() => {
          onClose();
          setConfirmText('');
        }, 1500);
      } else {
        showToast('Failed to delete book: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      showToast('Failed to delete book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      onClose();
    }
  };

  if (!isOpen || !book) return null;

  const canDelete = book.availableCopies === book.totalCopies; // No borrowed copies
  const borrowedCopies = book.totalCopies - book.availableCopies;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Trash2 className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Delete Book</h2>
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
          <div className="p-6 space-y-6">
          {/* Book Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Book className="w-5 h-5 text-teal-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">{book.title}</h3>
                <p className="text-sm text-gray-300">by {book.author}</p>
                <p className="text-sm text-gray-400">ISBN: {book.isbn}</p>
                <div className="mt-2 text-sm">
                  <span className="text-gray-300">Status: </span>
                  <span className="text-white font-medium">{book.availableCopies} available</span>
                  <span className="text-gray-400"> / {book.totalCopies} total</span>
                  {borrowedCopies > 0 && (
                    <span className="text-red-400 ml-2">({borrowedCopies} borrowed)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          <div className="space-y-4">
            {/* Cannot Delete Warning */}
            {!canDelete && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-medium">Cannot Delete Book</h4>
                    <p className="text-red-300 text-sm mt-1">
                      This book has {borrowedCopies} borrowed {borrowedCopies === 1 ? 'copy' : 'copies'}. 
                      You cannot delete a book while copies are still borrowed.
                    </p>
                    <p className="text-red-300 text-sm mt-2">
                      Please wait for all copies to be returned before attempting to delete this book.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Warning */}
            {canDelete && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-medium">Permanent Deletion</h4>
                    <p className="text-red-300 text-sm mt-1">
                      This action will permanently delete this book and all its records from the system. 
                      This action cannot be undone.
                    </p>
                    <ul className="text-red-300 text-sm mt-2 list-disc list-inside space-y-1">
                      <li>All book metadata will be removed</li>
                      <li>Historical borrow records will be preserved</li>
                      <li>The book will no longer be available for borrowing</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Input */}
          {canDelete && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type the book title to confirm deletion:
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Please type: <span className="text-white font-mono">{expectedConfirmText}</span>
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter book title exactly as shown above"
                disabled={loading}
              />
              {confirmText && !isConfirmed && (
                <p className="text-red-400 text-sm mt-1">
                  Title doesn't match. Please type exactly: "{expectedConfirmText}"
                </p>
              )}
              {isConfirmed && (
                <p className="text-green-400 text-sm mt-1">
                  ✓ Confirmation text matches
                </p>
              )}
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
              type="button"
              disabled={loading || !canDelete || !isConfirmed}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Book</span>
                </>
              )}
            </Button>
          </div>
          </div>
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

export default DeleteBookModal;