// Utility functions for the Library Management System

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const calculateDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getBookStatus = (totalCopies, availableCopies) => {
  if (availableCopies === 0) return 'Out of Stock';
  if (availableCopies <= 2) return 'Low Stock';
  return 'Available';
};

export const getUserRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-500/20 text-red-400';
    case 'librarian':
      return 'bg-primary-500/20 text-primary-400';
    case 'student':
      return 'bg-blue-500/20 text-blue-400';
    case 'faculty':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};