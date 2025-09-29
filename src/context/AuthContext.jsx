import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

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

  // User roles
  const USER_ROLES = {
    ADMIN: 'ADMIN',
    LIBRARIAN: 'LIBRARIAN',
    STUDENT: 'STUDENT'
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const response = await authService.getUserProfile();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('user_data', JSON.stringify(response.data));
          } else {
            authService.logout();
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const changePasswordFirstTime = async (passwordData) => {
    try {
      const response = await authService.changePasswordFirstTime(passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    changePasswordFirstTime,
    loading,
    USER_ROLES,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isLibrarian: user?.role === USER_ROLES.LIBRARIAN,
    isStudent: user?.role === USER_ROLES.STUDENT,
    mustChangePassword: user?.mustChangePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
