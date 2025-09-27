import { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock users data
  const users = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2024-01-15',
      booksLoaned: 3,
      fines: 0,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      role: 'Faculty',
      status: 'Active',
      joinDate: '2023-09-12',
      booksLoaned: 5,
      fines: 25.50,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      role: 'Student',
      status: 'Suspended',
      joinDate: '2023-11-03',
      booksLoaned: 1,
      fines: 45.00,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      role: 'Librarian',
      status: 'Active',
      joinDate: '2022-03-20',
      booksLoaned: 0,
      fines: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const stats = {
    total: 2845,
    active: 2720,
    suspended: 125,
    students: 2650,
    faculty: 180,
    librarians: 15
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'Suspended':
        return 'bg-red-500/20 text-red-400';
      case 'Inactive':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Student':
        return 'bg-blue-500/20 text-blue-400';
      case 'Faculty':
        return 'bg-purple-500/20 text-purple-400';
      case 'Librarian':
        return 'bg-primary-500/20 text-teal-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">User Management</h1>
          <p className="text-gray-400 mt-1">Manage library users and their permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-100">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.active.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{stats.suspended}</p>
              <p className="text-xs text-gray-400">Suspended</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.students.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.faculty}</p>
              <p className="text-xs text-gray-400">Faculty</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-400">{stats.librarians}</p>
              <p className="text-xs text-gray-400">Librarians</p>
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
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input-field"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="librarian">Librarians</option>
              </select>
              <Button variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="table-header text-left">User</th>
                  <th className="table-header text-left">Role</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Books Loaned</th>
                  <th className="table-header text-left">Fines</th>
                  <th className="table-header text-left">Join Date</th>
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-gray-100">{user.booksLoaned}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${user.fines > 0 ? 'text-red-400' : 'text-gray-100'}`}>
                        ${user.fines.toFixed(2)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400">
                      {user.joinDate}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.status === 'Active' ? (
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-green-400">
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
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

export default Users;
