import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import FirstTimePasswordChange from './components/auth/FirstTimePasswordChange';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Books from './pages/Books';
import Rooms from './pages/Rooms';
import RoomBookings from './pages/RoomBookings';
import NewBooking from './pages/NewBooking';
import Loans from './pages/Loans';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, mustChangePassword } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user must change password, redirect to password change page
  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const { isAuthenticated, mustChangePassword } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? 
              (mustChangePassword ? <Navigate to="/change-password" replace /> : <Navigate to="/dashboard" replace />) 
              : <Login />
          }
        />

        <Route
          path="/change-password"
          element={
            isAuthenticated && mustChangePassword ? 
              <FirstTimePasswordChange /> : 
              <Navigate to="/login" replace />
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/books"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}>
              <Layout>
                <Books />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}>
              <Layout>
                <Rooms />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN', 'STUDENT']}>
              <Layout>
                <RoomBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/new"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN', 'STUDENT']}>
              <Layout>
                <NewBooking />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}>
              <Layout>
                <Loans />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-loans"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <Layout>
                <Loans />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN', 'STUDENT']}>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN', 'STUDENT']}>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-100 mb-4">404</h1>
                <p className="text-gray-400">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
