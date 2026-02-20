import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to their respective dashboard if they try to access wrong role route
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
