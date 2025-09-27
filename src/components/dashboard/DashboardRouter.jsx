import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import LibrarianDashboard from './LibrarianDashboard';
import StudentDashboard from './StudentDashboard';

const DashboardRouter = () => {
  const { user, USER_ROLES } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.LIBRARIAN:
      return <LibrarianDashboard />;
    case USER_ROLES.STUDENT:
      return <StudentDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-64">
          <p className="text-gray-400">Unknown user role</p>
        </div>
      );
  }
};

export default DashboardRouter;
