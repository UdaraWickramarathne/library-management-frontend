import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  Book, 
  FileText, 
  CreditCard, 
  Settings,
  Home,
  Calendar,
  MapPin,
  Mail,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, USER_ROLES } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: [USER_ROLES.STUDENT]
    },
    {
      name: 'User Management',
      href: '/users',
      icon: Users,
      roles: [USER_ROLES.ADMIN]
    },
    {
      name: 'Book Management',
      href: '/books',
      icon: Book,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN]
    },
    {
      name: 'Room Management',
      href: '/rooms',
      icon: MapPin,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN]
    },
    {
      name: 'Room Bookings',
      href: '/bookings',
      icon: Calendar,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN, USER_ROLES.STUDENT]
    },
    {
      name: 'Loan Management',
      href: '/loans',
      icon: FileText,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN]
    },
    {
      name: 'My Loans',
      href: '/my-loans',
      icon: FileText,
      roles: [USER_ROLES.STUDENT]
    },
    {
      name: 'Fines & Payments',
      href: '/payments',
      icon: CreditCard,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN, USER_ROLES.STUDENT]
    },
    {
      name: 'Email Reminders',
      href: '/reminders',
      icon: Mail,
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN]
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-teal-400 mr-3 flex-shrink-0" />
            <span className="text-lg font-semibold text-gray-100">Library</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-slate-700 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-teal-500 text-white' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
                onClick={onClose}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium mr-3">
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role?.toLowerCase() || 'student'}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-200">
              <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Settings</span>
            </button>
            <button 
              className="flex items-center w-full px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-slate-700 hover:text-red-300 transition-colors duration-200"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
