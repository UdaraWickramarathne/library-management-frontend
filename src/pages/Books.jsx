import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import CreateBookModal from '../components/ui/CreateBookModal';
import { 
  EditBookModal,
  MarkBookLostModal,
  AddCopiesModal,
  DeleteBookModal
} from '../components/ui';
import Toast from '../components/ui/Toast';
import { 
  Search, 
  Filter, 
  Book, 
  Plus, 
  RefreshCw,
  Users,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  PlusCircle,
  Minus
} from 'lucide-react';

const Books = () => {
  const { user, USER_ROLES } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchType, setSearchType] = useState('title'); // title, author, isbn
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMarkLostModal, setShowMarkLostModal] = useState(false);
  const [showAddCopiesModal, setShowAddCopiesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0
  });

  // Stats (calculated from books data)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    loaned: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadBooks();
    loadGenres();
  }, [pagination.page, selectedGenre, selectedStatus]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        loadBooks();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      loadBooks();
    }
  }, [searchQuery, searchType]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery.trim()) {
        // Perform search
        const filters = {};
        filters[searchType] = searchQuery;
        if (selectedGenre !== 'all') filters.genre = selectedGenre;
        if (selectedStatus !== 'all') filters.status = selectedStatus.toUpperCase();
        
        response = await bookService.searchBooks(filters, pagination.page, pagination.size);
      } else {
        // Get all books with filters
        if (selectedStatus === 'available') {
          response = await bookService.getAvailableBooks(pagination.page, pagination.size);
        } else {
          response = await bookService.getAllBooks(pagination.page, pagination.size);
        }
      }

      if (response.success && response.data) {
        const booksData = response.data.content || response.data;
        setBooks(Array.isArray(booksData) ? booksData : []);
        
        if (response.data.content) {
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements
          }));
        }

        // Calculate stats
        calculateStats(booksData);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error.message);
      showToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const response = await bookService.getAllGenres();
      if (response.success && response.data) {
        setGenres(['all', ...response.data]);
      }
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const calculateStats = (booksData) => {
    if (!Array.isArray(booksData)) return;
    
    const total = booksData.length;
    const available = booksData.filter(book => 
      book.status?.toLowerCase() === 'available' && book.availableCopies > 0
    ).length;
    const loaned = booksData.reduce((sum, book) => {
      // Only count loaned copies for available books
      if (book.status?.toLowerCase() === 'available') {
        return sum + (book.totalCopies - book.availableCopies);
      }
      return sum;
    }, 0);
    const lowStock = booksData.filter(book => 
      book.status?.toLowerCase() === 'available' && 
      book.availableCopies <= 2 && 
      book.availableCopies > 0
    ).length;

    setStats({ total, available, loaned, lowStock });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    loadBooks();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedStatus('all');
    setSearchType('title');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleBookCreated = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
    calculateStats([newBook, ...books]);
    showToast('Book added successfully!', 'success');
    loadBooks(); // Refresh the list
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks(prev => prev.map(book => 
      book.isbn === updatedBook.isbn ? updatedBook : book
    ));
    calculateStats(books.map(book => 
      book.isbn === updatedBook.isbn ? updatedBook : book
    ));
    showToast('Book updated successfully!', 'success');
  };

  const handleBookDeleted = (deletedBook) => {
    setBooks(prev => prev.filter(book => book.isbn !== deletedBook.isbn));
    calculateStats(books.filter(book => book.isbn !== deletedBook.isbn));
    showToast('Book deleted successfully!', 'success');
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const openMarkLostModal = (book) => {
    setSelectedBook(book);
    setShowMarkLostModal(true);
  };

  const openAddCopiesModal = (book) => {
    setSelectedBook(book);
    setShowAddCopiesModal(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const closeAllModals = () => {
    setShowEditModal(false);
    setShowMarkLostModal(false);
    setShowAddCopiesModal(false);
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages - 1) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 0) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const getStatusColor = (book) => {
    switch (book.status?.toLowerCase()) {
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'available':
        if (book.availableCopies === 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (book.availableCopies <= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (book) => {
    switch (book.status?.toLowerCase()) {
      case 'lost':
        return 'Lost';
      case 'unavailable':
        return 'Unavailable';
      case 'available':
        if (book.availableCopies === 0) return 'Out of Stock';
        if (book.availableCopies <= 2) return 'Low Stock';
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Error Loading Books</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button onClick={loadBooks}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Book Management</h1>
          <p className="text-gray-400 mt-1">Manage library catalog and book inventory</p>
        </div>
        {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN) && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-lg font-bold text-gray-100">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Books</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-green-400">{stats.available}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-yellow-400">{stats.loaned}</p>
            <p className="text-xs text-gray-400">Loaned</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-red-400">{stats.lowStock}</p>
            <p className="text-xs text-gray-400">Low Stock</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:border-teal-500 focus:outline-none"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="isbn">ISBN</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Genres</option>
                {genres.filter(genre => genre !== 'all').map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
              <Button variant="secondary" onClick={clearFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Books Grid/Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Books ({pagination.totalElements || books.length})
            </h3>
            <Button onClick={loadBooks} variant="secondary" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">No Books Found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding some books to the library'}
              </p>
              {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN) && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Book
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Book</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Author</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Genre</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">ISBN</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Copies</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.isbn} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center mr-3">
                              <Book className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-100">{book.title}</p>
                              <p className="text-sm text-gray-400">
                                Published {book.publicationYear || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-100">{book.author}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400">
                            {book.genre}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-gray-400">{book.isbn}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book)}`}>
                            {getStatusText(book)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <span className="font-medium text-gray-100">{book.availableCopies}</span>
                            <span className="text-gray-400"> / {book.totalCopies}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-teal-500 h-1.5 rounded-full"
                              style={{ 
                                width: `${book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-1">
                            {/* <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN) && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Edit Book"
                                  onClick={() => openEditModal(book)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                {book.status?.toLowerCase() === 'available' && book.availableCopies > 0 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    title="Mark Copies as Lost"
                                    className="text-orange-400 hover:text-orange-300"
                                    onClick={() => openMarkLostModal(book)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Add Copies"
                                  className="text-green-400 hover:text-green-300"
                                  onClick={() => openAddCopiesModal(book)}
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-400 hover:text-red-300"
                                  title="Delete Book"
                                  onClick={() => openDeleteModal(book)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {user?.role === USER_ROLES.STUDENT && 
                             book.status?.toLowerCase() === 'available' && 
                             book.availableCopies > 0 && (
                              <Button variant="ghost" size="sm" title="Borrow Book">
                                <BookOpen className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Showing {pagination.page * pagination.size + 1} to{' '}
                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                    {pagination.totalElements} books
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={prevPage}
                      disabled={pagination.page === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {pagination.page + 1} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={nextPage}
                      disabled={pagination.page >= pagination.totalPages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Create Book Modal */}
      {showCreateModal && (
        <CreateBookModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onBookCreated={handleBookCreated}
        />
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <EditBookModal
          isOpen={showEditModal}
          onClose={closeAllModals}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
        />
      )}

      {/* Mark Book Lost Modal */}
      {showMarkLostModal && selectedBook && (
        <MarkBookLostModal
          isOpen={showMarkLostModal}
          onClose={closeAllModals}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
        />
      )}

      {/* Add Copies Modal */}
      {showAddCopiesModal && selectedBook && (
        <AddCopiesModal
          isOpen={showAddCopiesModal}
          onClose={closeAllModals}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
        />
      )}

      {/* Delete Book Modal */}
      {showDeleteModal && selectedBook && (
        <DeleteBookModal
          isOpen={showDeleteModal}
          onClose={closeAllModals}
          book={selectedBook}
          onBookDeleted={handleBookDeleted}
        />
      )}

      {/* Toast */}
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

export default Books;
