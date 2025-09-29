import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import CreateUserModal from '../components/users/CreateUserModal';
import UpdateUserModal from '../components/users/UpdateUserModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/Toast';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    students: 0,
    faculty: 0,
    librarians: 0
  });

  const { isAdmin } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsers();
      
      if (response.success) {
        const userData = response.data.content || response.data;
        setUsers(userData);
        
        // Calculate stats
        const totalUsers = userData.length;
        const activeUsers = userData.filter(user => user.status === 'ACTIVE').length;
        const suspendedUsers = userData.filter(user => user.status === 'INACTIVE').length;
        const students = userData.filter(user => user.role === 'STUDENT').length;
        const librarians = userData.filter(user => user.role === 'LIBRARIAN').length;
        const admins = userData.filter(user => user.role === 'ADMIN').length;

        setStats({
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          students: students,
          librarians: librarians,
          admins: admins
        });
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-500/20 text-blue-400';
      case 'LIBRARIAN':
        return 'bg-teal-500/20 text-teal-400';
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleUserCreated = (newUser) => {
    fetchUsers(); // Refresh the users list
    showToast(`User ${newUser.fullName} created successfully!`, 'success');
  };

  const handleUserUpdated = (updatedUser) => {
    fetchUsers(); // Refresh the users list
    setSelectedUser(null);
    showToast(`User ${updatedUser.fullName} updated successfully!`, 'success');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleActivateUser = (user) => {
    setSelectedUser(user);
    setConfirmAction({
      type: 'activate',
      title: 'Activate User',
      message: `Are you sure you want to activate ${user.fullName}? They will be able to access the system again.`,
      confirmText: 'Activate',
      isDestructive: false
    });
    setShowConfirmModal(true);
  };

  const handleDeactivateUser = (user) => {
    setSelectedUser(user);
    setConfirmAction({
      type: 'deactivate',
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user.fullName}? They will lose access to the system.`,
      confirmText: 'Deactivate',
      isDestructive: true
    });
    setShowConfirmModal(true);
  };

  const executeUserAction = async () => {
    if (!selectedUser || !confirmAction) return;

    setActionLoading(true);
    try {
      let response;
      if (confirmAction.type === 'activate') {
        response = await userService.activateUser(selectedUser.id);
      } else if (confirmAction.type === 'deactivate') {
        response = await userService.deactivateUser(selectedUser.id);
      }

      if (response.success) {
        fetchUsers(); // Refresh the list
        setShowConfirmModal(false);
        const actionText = confirmAction.type === 'activate' ? 'activated' : 'deactivated';
        showToast(`User ${selectedUser.fullName} ${actionText} successfully!`, 'success');
        setSelectedUser(null);
        setConfirmAction(null);
      } else {
        setError(response.message || `Failed to ${confirmAction.type} user`);
        showToast(response.message || `Failed to ${confirmAction.type} user`, 'error');
      }
    } catch (error) {
      setError(error.message || `Failed to ${confirmAction.type} user`);
      showToast(error.message || `Failed to ${confirmAction.type} user`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
              <p className="text-xs text-gray-400">Inactive</p>
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
              <p className="text-2xl font-bold text-teal-400">{stats.librarians}</p>
              <p className="text-xs text-gray-400">Librarians</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.admins}</p>
              <p className="text-xs text-gray-400">Admins</p>
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
                <option value="librarian">Librarians</option>
                <option value="admin">Admins</option>
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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="table-cell text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-cell text-center py-8 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-600 rounded-full mr-3 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-100">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">{user.fullName}</p>
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
                        <span className="font-medium text-gray-100">-</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-medium text-gray-100">-</span>
                      </td>
                      <td className="table-cell text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                            disabled={!isAdmin}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.status === 'ACTIVE' ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400"
                              title="Deactivate User"
                              onClick={() => handleDeactivateUser(user)}
                              disabled={!isAdmin}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-400"
                              title="Activate User"
                              onClick={() => handleActivateUser(user)}
                              disabled={!isAdmin}
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Update User Modal */}
      <UpdateUserModal 
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedUser(null);
          setConfirmAction(null);
        }}
        onConfirm={executeUserAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={confirmAction?.confirmText || 'Confirm'}
        isDestructive={confirmAction?.isDestructive || false}
        loading={actionLoading}
      />

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
};

export default Users;
