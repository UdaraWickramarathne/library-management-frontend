import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Star,
  TrendingUp,
  Search,
  X,
  Filter,
  Heart,
  Plus,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const StudentDashboard = () => {
  // State for browse books modal
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);

  // Mock data
  const stats = {
    booksLoaned: 3,
    overdueBooks: 1,
    totalFines: 15.50,
    daysUntilDue: 5
  };

  const currentLoans = [
    {
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      dueDate: "2024-01-15",
      daysLeft: 5,
      cover: "https://via.placeholder.com/80x120/1e293b/f1f5f9?text=Clean+Code"
    },
    {
      id: 2,
      title: "The Pragmatic Programmer",
      author: "David Thomas",
      dueDate: "2024-01-12",
      daysLeft: 2,
      cover: "https://via.placeholder.com/80x120/1e293b/f1f5f9?text=Pragmatic"
    },
    {
      id: 3,
      title: "Design Patterns",
      author: "Gang of Four",
      dueDate: "2024-01-08",
      daysLeft: -2,
      cover: "https://via.placeholder.com/80x120/1e293b/f1f5f9?text=Design"
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      rating: 4.5,
      cover: "https://via.placeholder.com/40x56/1e293b/f1f5f9?text=JS"
    },
    {
      id: 2,
      title: "System Design Interview",
      author: "Alex Xu",
      rating: 4.8,
      cover: "https://via.placeholder.com/40x56/1e293b/f1f5f9?text=SYS"
    }
  ];

  const fines = [
    {
      id: 1,
      book: "Design Patterns",
      amount: 15.50,
      reason: "Late return (2 days overdue)",
      dueDate: "2024-01-08"
    }
  ];

  // Available books for browsing
  const availableBooks = [
    {
      id: 1,
      title: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      category: "Computer Science",
      isbn: "978-0596517748",
      published: "2008",
      pages: 176,
      rating: 4.5,
      reviews: 234,
      available: true,
      copies: 3,
      description: "Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad, having been developed and released in a hurry before it could be refined.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=JS+Good+Parts"
    },
    {
      id: 2,
      title: "Clean Architecture",
      author: "Robert C. Martin",
      category: "Computer Science",
      isbn: "978-0134494166",
      published: "2017",
      pages: 432,
      rating: 4.7,
      reviews: 189,
      available: true,
      copies: 2,
      description: "A comprehensive guide to software architecture and design principles for building maintainable, flexible, and testable applications.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=Clean+Arch"
    },
    {
      id: 3,
      title: "Introduction to Linear Algebra",
      author: "Gilbert Strang",
      category: "Mathematics",
      isbn: "978-0980232776",
      published: "2016",
      pages: 584,
      rating: 4.8,
      reviews: 156,
      available: false,
      copies: 0,
      description: "A comprehensive introduction to the basic concepts of linear algebra, along with an introduction to the ideas of mathematical proof.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=Linear+Algebra"
    },
    {
      id: 4,
      title: "Organic Chemistry",
      author: "Paula Yurkanis Bruice",
      category: "Chemistry",
      isbn: "978-0134042282",
      published: "2019",
      pages: 1248,
      rating: 4.3,
      reviews: 92,
      available: true,
      copies: 4,
      description: "A student-friendly approach to organic chemistry with emphasis on understanding rather than memorization.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=Organic+Chem"
    },
    {
      id: 5,
      title: "Physics for Scientists and Engineers",
      author: "Raymond A. Serway",
      category: "Physics",
      isbn: "978-1133947271",
      published: "2018",
      pages: 1552,
      rating: 4.6,
      reviews: 203,
      available: true,
      copies: 5,
      description: "A comprehensive physics textbook covering mechanics, thermodynamics, electromagnetism, and modern physics.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=Physics"
    },
    {
      id: 6,
      title: "Data Structures and Algorithms in Python",
      author: "Michael T. Goodrich",
      category: "Computer Science",
      isbn: "978-1118290279",
      published: "2013",
      pages: 770,
      rating: 4.4,
      reviews: 167,
      available: true,
      copies: 2,
      description: "A comprehensive guide to data structures and algorithms implemented in Python programming language.",
      cover: "https://via.placeholder.com/120x160/1e293b/f1f5f9?text=DS+Algo"
    }
  ];

  const categories = [
    'all',
    'Computer Science',
    'Mathematics', 
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History'
  ];

  // Filter books based on search and category
  const filteredBooks = availableBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle book reservation
  const handleReserveBook = (bookId) => {
    console.log('Reserving book:', bookId);
    // Add reservation logic here
    alert('Book reservation request sent!');
  };

  // Handle opening book details
  const handleViewBookDetails = (book) => {
    setSelectedBook(book);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Good morning, Bob! 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your library account</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => setShowBrowseModal(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Books
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-teal-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Books Loaned</p>
                <p className="text-2xl font-bold text-gray-100">{stats.booksLoaned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Due Soon</p>
                <p className="text-2xl font-bold text-gray-100">{stats.daysUntilDue} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-100">{stats.overdueBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Fines</p>
                <p className="text-2xl font-bold text-gray-100">${stats.totalFines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Current Loans */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center h-7">Current Loans</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {currentLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/30">
                    <div className="flex items-center flex-1">
                      <img
                        src={loan.cover}
                        alt={loan.title}
                        className="w-14 h-18 object-cover rounded border border-slate-600"
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="font-semibold text-gray-100 text-base">{loan.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{loan.author}</p>
                        <div className="flex items-center mt-2">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span className={`text-sm font-medium ${
                            loan.daysLeft < 0 
                              ? 'text-red-400' 
                              : loan.daysLeft <= 2 
                              ? 'text-yellow-400' 
                              : 'text-teal-400'
                          }`}>
                            {loan.daysLeft < 0 
                              ? `${Math.abs(loan.daysLeft)} days overdue`
                              : `${loan.daysLeft} days left`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="primary" className="bg-teal-500 hover:bg-teal-600 min-w-[80px]">Renew</Button>
                      {loan.daysLeft < 0 && (
                        <Button size="sm" variant="danger" className="min-w-[80px]">Pay Fine</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Outstanding Fines */}
          {fines.length > 0 && (
            <Card className="h-fit">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-red-400 flex items-center text-lg font-semibold h-7">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Outstanding Fines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {fines.map((fine) => (
                    <div key={fine.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-100 text-base">{fine.book}</span>
                        <span className="text-red-400 font-bold text-lg">${fine.amount}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{fine.reason}</p>
                      <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2">
                        Pay Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="h-fit">
            <CardHeader className="px-6 py-4">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-100">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recommendations.map((book) => (
                  <div key={book.id} className="flex items-center p-3 hover:bg-slate-700/30 rounded-lg transition-colors">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded border border-slate-600"
                    />
                    <div className="ml-4 flex-1">
                      <h5 className="text-sm font-semibold text-gray-100 leading-tight">{book.title}</h5>
                      <p className="text-xs text-gray-400 mt-1">{book.author}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400 ml-1 font-medium">{book.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="w-full mt-6 text-teal-400 hover:text-teal-300 hover:bg-teal-400/10">
                View All Recommendations
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="h-fit">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-semibold text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start py-3 hover:bg-slate-600"
                  onClick={() => setShowBrowseModal(true)}
                >
                  <Search className="w-4 h-4 mr-3" />
                  Search Catalog
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start py-3 hover:bg-slate-600">
                  <Clock className="w-4 h-4 mr-3" />
                  Loan History
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start py-3 hover:bg-slate-600">
                  <DollarSign className="w-4 h-4 mr-3" />
                  Payment History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Browse Books Modal */}
      {showBrowseModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col backdrop-blur-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-gray-100">Browse Books</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBrowseModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by title, author, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                  <Button variant="secondary" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div className="flex gap-4 mb-4">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-20 h-28 object-cover rounded border border-slate-600"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-100 text-sm leading-tight mb-1">
                              {book.title}
                            </h3>
                            <p className="text-xs text-gray-400 mb-2">{book.author}</p>
                            <span className="inline-block px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                              {book.category}
                            </span>
                            <div className="flex items-center mt-2">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400 ml-1">{book.rating}</span>
                              <span className="text-xs text-gray-500 ml-1">({book.reviews})</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">
                          {book.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-gray-400">
                            <p>Published: {book.published}</p>
                            <p>Pages: {book.pages}</p>
                          </div>
                          <div className="text-right">
                            {book.available ? (
                              <span className="text-xs text-green-400">
                                {book.copies} available
                              </span>
                            ) : (
                              <span className="text-xs text-red-400">
                                Not available
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewBookDetails(book)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                          {book.available ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 bg-teal-500 hover:bg-teal-600"
                              onClick={() => handleReserveBook(book.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Reserve
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              disabled
                            >
                              <Heart className="w-3 h-3 mr-1" />
                              Wishlist
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No books found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-100">Book Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBook(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-6 mb-6">
                <img
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  className="w-32 h-44 object-cover rounded border border-slate-600"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    {selectedBook.title}
                  </h3>
                  <p className="text-gray-400 mb-2">by {selectedBook.author}</p>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300 ml-1">{selectedBook.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({selectedBook.reviews} reviews)</span>
                    </div>
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-sm rounded-full">
                      {selectedBook.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">ISBN:</span>
                      <span className="text-gray-100 ml-2">{selectedBook.isbn}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Published:</span>
                      <span className="text-gray-100 ml-2">{selectedBook.published}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Pages:</span>
                      <span className="text-gray-100 ml-2">{selectedBook.pages}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Availability:</span>
                      <span className={`ml-2 ${selectedBook.available ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedBook.available ? `${selectedBook.copies} available` : 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Description</h4>
                <p className="text-gray-400 leading-relaxed">{selectedBook.description}</p>
              </div>

              <div className="flex gap-3">
                {selectedBook.available ? (
                  <Button
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                    onClick={() => {
                      handleReserveBook(selectedBook.id);
                      setSelectedBook(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Reserve This Book
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    disabled
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSelectedBook(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
