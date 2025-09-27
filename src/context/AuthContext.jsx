import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user roles
  const USER_ROLES = {
    ADMIN: 'admin',
    LIBRARIAN: 'librarian',
    STUDENT: 'student'
  };

  // Mock users for demo
  const mockUsers = {
    'admin@library.com': { 
      id: 1, 
      email: 'admin@library.com', 
      name: 'John Admin', 
      role: USER_ROLES.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    'librarian@library.com': { 
      id: 2, 
      email: 'librarian@library.com', 
      name: 'Jane Librarian', 
      role: USER_ROLES.LIBRARIAN,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    'student@library.com': { 
      id: 3, 
      email: 'student@library.com', 
      name: 'Bob Student', 
      role: USER_ROLES.STUDENT,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face'
    }
  };

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('library_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('library_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - in real app, this would be an API call
    const user = mockUsers[email];
    if (user && password === 'password') {
      setUser(user);
      localStorage.setItem('library_user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    USER_ROLES,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isLibrarian: user?.role === USER_ROLES.LIBRARIAN,
    isStudent: user?.role === USER_ROLES.STUDENT,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
