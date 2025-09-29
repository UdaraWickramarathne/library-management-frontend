import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import Toast from './Toast';
import { bookService } from '../../services/bookService';
import { 
  X, 
  Search, 
  Book, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';

const CreateBookModal = ({ isOpen, onClose, onBookCreated }) => {
  const [step, setStep] = useState(1); // 1: ISBN Entry, 2: Review/Manual Entry, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [isbn, setIsbn] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [metadataError, setMetadataError] = useState(null);
  
  const [bookData, setBookData] = useState({
    isbn: '',
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
    skipMetadataFetch: false
  });

  const [errors, setErrors] = useState({});

  // Step 1: Handle ISBN submission
  const handleIsbnSubmit = async (e) => {
    e.preventDefault();
    if (!isbn.trim()) {
      showToast('Please enter an ISBN', 'error');
      return;
    }

    setFetchingMetadata(true);
    setMetadataError(null);
    
    try {
      // First check if book already exists
      const existingBook = await bookService.getBookByIsbn(isbn);
      if (existingBook.success) {
        showToast('Book with this ISBN already exists in the catalog', 'error');
        setFetchingMetadata(false);
        return;
      }
    } catch (error) {
      // Book doesn't exist, continue with metadata fetch
    }

    try {
      const response = await bookService.fetchBookMetadata(isbn);
      if (response.success && response.data) {
        setMetadata(response.data);
        setBookData({
          ...bookData,
          isbn: isbn,
          title: response.data.title || '',
          author: response.data.author || '',
          publisher: response.data.publisher || '',
          publicationYear: response.data.publishedDate ? new Date(response.data.publishedDate).getFullYear() : '',
          description: response.data.description || '',
          language: response.data.language || 'English',
          pages: response.data.pageCount || '',
          genre: response.data.categories?.[0] || ''
        });
        setStep(2);
      } else {
        throw new Error('No metadata found');
      }
    } catch (error) {
      console.log('Metadata fetch failed, proceeding with manual entry:', error.message);
      setMetadataError('Book metadata not found. Please enter book details manually.');
      setBookData({ ...bookData, isbn: isbn, skipMetadataFetch: true });
      setStep(2);
    } finally {
      setFetchingMetadata(false);
    }
  };

  // Step 2: Handle book creation
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBookData()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = metadata 
        ? await bookService.createBookWithMetadata(bookData)
        : await bookService.createBook(bookData);
      
      if (response.success) {
        showToast('Book added successfully!', 'success');
        setStep(3);
        onBookCreated?.(response.data);
        
        // Auto close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create book');
      }
    } catch (error) {
      console.error('Error creating book:', error);
      showToast(error.message || 'Failed to create book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateBookData = () => {
    const newErrors = {};

    if (!bookData.isbn) newErrors.isbn = 'ISBN is required';
    if (!bookData.title) newErrors.title = 'Title is required';
    if (!bookData.author) newErrors.author = 'Author is required';
    if (!bookData.totalCopies || bookData.totalCopies < 1) newErrors.totalCopies = 'At least 1 copy is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setBookData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleClose = () => {
    setStep(1);
    setIsbn('');
    setMetadata(null);
    setMetadataError(null);
    setBookData({
      isbn: '',
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
      skipMetadataFetch: false
    });
    setErrors({});
    setLoading(false);
    setFetchingMetadata(false);
    onClose();
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Book className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">
              {step === 1 ? 'Add New Book - Enter ISBN' : 
               step === 2 ? 'Add New Book - Book Details' : 
               'Book Added Successfully'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

        <div className="p-6">
          {/* Step 1: ISBN Entry */}
          {step === 1 && (
            <form onSubmit={handleIsbnSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 1: Enter or Scan ISBN
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Enter the ISBN to automatically fetch book details, or proceed manually if not found.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ISBN *
                    </label>
                    <Input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Enter ISBN (e.g., 9780132350884)"
                      className="w-full"
                      disabled={fetchingMetadata}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Supports ISBN-10 and ISBN-13 formats
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={fetchingMetadata}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={fetchingMetadata || !isbn.trim()}
                  className="flex items-center space-x-2"
                >
                  {fetchingMetadata ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching Details...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Fetch Book Details</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Review/Manual Entry */}
          {step === 2 && (
            <form onSubmit={handleBookSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Step 2: Review & Complete Book Details
                </h3>
                
                {metadata && (
                  <div className="bg-teal-900 bg-opacity-30 border border-teal-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                      <span className="text-teal-400 font-medium">Metadata Found!</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Book details have been automatically filled. Please review and add any missing information.
                    </p>
                  </div>
                )}

                {metadataError && (
                  <div className="bg-amber-900 bg-opacity-30 border border-amber-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400 font-medium">Manual Entry Required</span>
                    </div>
                    <p className="text-gray-300 text-sm">{metadataError}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ISBN (read-only) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ISBN
                  </label>
                  <Input
                    type="text"
                    value={bookData.isbn}
                    disabled
                    className="bg-slate-700 text-gray-400"
                  />
                </div>

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={bookData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter book title"
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
                    value={bookData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Enter author name"
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
                    value={bookData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    placeholder="Enter publisher name"
                  />
                </div>

                {/* Publication Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Publication Year
                  </label>
                  <Input
                    type="number"
                    value={bookData.publicationYear}
                    onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                    placeholder="2023"
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
                    value={bookData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="Enter genre"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <Input
                    type="text"
                    value={bookData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    placeholder="English"
                  />
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pages
                  </label>
                  <Input
                    type="number"
                    value={bookData.pages}
                    onChange={(e) => handleInputChange('pages', e.target.value)}
                    placeholder="320"
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
                    value={bookData.totalCopies}
                    onChange={(e) => handleInputChange('totalCopies', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    min="1"
                    max="1000"
                    className={errors.totalCopies ? 'border-red-500' : ''}
                  />
                  {errors.totalCopies && (
                    <p className="text-red-400 text-sm mt-1">{errors.totalCopies}</p>
                  )}
                </div>

                {/* Shelf Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shelf Location
                  </label>
                  <Input
                    type="text"
                    value={bookData.shelfLocation}
                    onChange={(e) => handleInputChange('shelfLocation', e.target.value)}
                    placeholder="e.g., CS-001, FICTION-A"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={bookData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter book description"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={loading}
                >
                  Back
                </Button>
                <div className="flex space-x-3">
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
                        <span>Adding Book...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Book</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Book Added Successfully!
              </h3>
              <p className="text-gray-300 mb-4">
                "{bookData.title}" has been added to the library catalog.
              </p>
              <div className="bg-slate-700 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">ISBN:</span> {bookData.isbn}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Copies:</span> {bookData.totalCopies}
                </p>
                {bookData.shelfLocation && (
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Location:</span> {bookData.shelfLocation}
                  </p>
                )}
              </div>
            </div>
          )}
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

export default CreateBookModal;