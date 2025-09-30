import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { userService } from '../../services/userService.js';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'STUDENT',
    contactNumber: '',
    // Student-specific fields
    studentId: '',
    department: '',
    yearOfStudy: 1,
    // Librarian-specific fields
    employeeId: '',
    branch: '',
    workShift: 'Morning',
    // Admin-specific fields
    adminId: '',
    permissions: 'ALL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      role: 'STUDENT',
      contactNumber: '',
      studentId: '',
      department: '',
      yearOfStudy: 1,
      employeeId: '',
      branch: '',
      workShift: 'Morning',
      adminId: '',
      permissions: 'ALL'
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

    if (formData.role === 'STUDENT' && !formData.studentId) {
      setError('Student ID is required for student accounts');
      return false;
    }

    if (formData.role === 'LIBRARIAN' && !formData.employeeId) {
      setError('Employee ID is required for librarian accounts');
      return false;
    }

    if (formData.role === 'ADMIN' && !formData.adminId) {
      setError('Admin ID is required for admin accounts');
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
      let response;
      
      if (formData.role === 'STUDENT') {
        response = await userService.createStudent({
          fullName: formData.fullName,
          email: formData.email,
          studentId: formData.studentId,
          department: formData.department,
          yearOfStudy: formData.yearOfStudy,
          contactNumber: formData.contactNumber
        });
      } else if (formData.role === 'LIBRARIAN') {
        response = await userService.createLibrarian({
          fullName: formData.fullName,
          email: formData.email,
          employeeId: formData.employeeId,
          branch: formData.branch,
          workShift: formData.workShift,
          contactNumber: formData.contactNumber
        });
      } else if (formData.role === 'ADMIN') {
        response = await userService.createAdmin({
          fullName: formData.fullName,
          email: formData.email,
          adminId: formData.adminId,
          department: formData.department,
          contactNumber: formData.contactNumber,
          permissions: formData.permissions
        });
      }

      if (response.success) {
        setSuccess(`${formData.role.toLowerCase()} account created successfully! Welcome email has been sent.`);
        onUserCreated(response.data);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to create user account');
      }
    } catch (error) {
      setError(error.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New User Account</CardTitle>
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

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <Input
                  label="Contact Number"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                />

                {formData.role === 'STUDENT' && (
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
                      required
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
                        required
                      >
                        {[1,2,3,4,5,6,7,8].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {formData.role === 'LIBRARIAN' && (
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
                      required
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
                        required
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.role === 'ADMIN' && (
                  <>
                    <Input
                      label="Admin ID"
                      type="text"
                      name="adminId"
                      value={formData.adminId}
                      onChange={handleInputChange}
                      placeholder="Enter admin ID"
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
                        Permissions
                      </label>
                      <select
                        name="permissions"
                        value={formData.permissions}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      >
                        <option value="ALL">All Permissions</option>
                        <option value="READ_WRITE">Read & Write</option>
                        <option value="READ_ONLY">Read Only</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  📧 A welcome email with login credentials will be sent to the user's email address.
                  The user will need to change their password on first login.
                </p>
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
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateUserModal;