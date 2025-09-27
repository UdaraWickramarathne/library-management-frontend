import { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Books = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock books data
  const books = [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      status: 'Available',
      totalCopies: 5,
      availableCopies: 3,
      publicationYear: 2008,
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop'
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      author: 'David Thomas',
      isbn: '978-0201616224',
      category: 'Computer Science',
      status: 'Available',
      totalCopies: 3,
      availableCopies: 1,
      publicationYear: 1999,
      cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=120&fit=crop'
    },
    {
      id: 3,
      title: 'Design Patterns',
      author: 'Gang of Four',
      isbn: '978-0201633612',
      category: 'Computer Science',
      status: 'Low Stock',
      totalCopies: 2,
      availableCopies: 0,
      publicationYear: 1994,
      cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80&h=120&fit=crop'
    },
    {
      id: 4,
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '978-0262033848',
      category: 'Computer Science',
      status: 'Available',
      totalCopies: 8,
      availableCopies: 5,
      publicationYear: 2009,
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=80&h=120&fit=crop'
    }
  ];

  const stats = {
    total: 15420,
    available: 12850,
    loaned: 2340,
    reserved: 230,
    categories: 24,
    authors: 8920
  };

  const categories = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500/20 text-green-400';
      case 'Low Stock':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Out of Stock':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Book Management</h1>
          <p className="text-gray-400 mt-1">Manage library catalog and book inventory</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Book
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <div className="ml-3">
                <p className="text-lg font-bold text-gray-100">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Total Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{stats.available.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-400">{stats.loaned.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Loaned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{stats.reserved}</p>
              <p className="text-xs text-gray-400">Reserved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">{stats.categories}</p>
              <p className="text-xs text-gray-400">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-teal-400">{stats.authors.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Authors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
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
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Button variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Books ({filteredBooks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="table-header text-left">Book</th>
                  <th className="table-header text-left">Author</th>
                  <th className="table-header text-left">Category</th>
                  <th className="table-header text-left">ISBN</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Availability</th>
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-700/50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-100">{book.title}</p>
                          <p className="text-sm text-gray-400">Published {book.publicationYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-100">{book.author}</span>
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-teal-400">
                        {book.category}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-gray-400">{book.isbn}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <span className="font-medium text-gray-100">{book.availableCopies}</span>
                        <span className="text-gray-400"> / {book.totalCopies}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ 
                            width: `${(book.availableCopies / book.totalCopies) * 100}%` 
                          }}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Books;
