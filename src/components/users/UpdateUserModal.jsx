import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { userService } from '../../services/userService.js';

const UpdateUserModal = ({ isOpen, onClose, onUserUpdated, user }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    // Student-specific fields
    studentId: '',
    department: '',
    yearOfStudy: 1,
    // Librarian-specific fields
    employeeId: '',
    branch: '',
    workShift: 'Morning'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Populate form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        // Student-specific fields
        studentId: user.studentId || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || 1,
        // Librarian-specific fields
        employeeId: user.employeeId || '',
        branch: user.branch || '',
        workShift: user.workShift || 'Morning'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      contactNumber: '',
      studentId: '',
      department: '',
      yearOfStudy: 1,
      employeeId: '',
      branch: '',
      workShift: 'Morning'
    });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email) {
      setError('Full name and email are required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (user?.role === 'STUDENT' && !formData.studentId) {
      setError('Student ID is required for student accounts');
      return false;
    }

    if (user?.role === 'LIBRARIAN' && !formData.employeeId) {
      setError('Employee ID is required for librarian accounts');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare update data based on user role
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber
      };

      // Add role-specific fields
      if (user.role === 'STUDENT') {
        updateData.studentId = formData.studentId;
        updateData.department = formData.department;
        updateData.yearOfStudy = parseInt(formData.yearOfStudy);
      } else if (user.role === 'LIBRARIAN') {
        updateData.employeeId = formData.employeeId;
        updateData.branch = formData.branch;
        updateData.workShift = formData.workShift;
      }

      const response = await userService.updateUser(user.id, updateData);

      if (response.success) {
        setSuccess('User updated successfully!');
        onUserUpdated(response.data);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (error) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Update User Account</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />

                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'STUDENT' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'LIBRARIAN' ? 'bg-teal-500/20 text-teal-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {user.role}
                    </span>
                    <span className="ml-2 text-sm text-gray-400">Role (cannot be changed)</span>
                  </div>
                </div>

                <Input
                  label="Contact Number"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                />

                {user.role === 'STUDENT' && (
                  <>
                    <Input
                      label="Student ID"
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder="Enter student ID"
                      required
                    />
                    <Input
                      label="Department"
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Enter department"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Year of Study
                      </label>
                      <select
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      >
                        {[1,2,3,4,5,6,7,8].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {user.role === 'LIBRARIAN' && (
                  <>
                    <Input
                      label="Employee ID"
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="Enter employee ID"
                      required
                    />
                    <Input
                      label="Branch"
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      placeholder="Enter branch"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Work Shift
                      </label>
                      <select
                        name="workShift"
                        value={formData.workShift}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Admin accounts can only update basic information (name, email, contact).
                      Admin-specific fields cannot be modified.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateUserModal;