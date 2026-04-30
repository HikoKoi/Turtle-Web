import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl font-bold">Đang tải... 🐢</p>
            </div>
        );
    }

    return user ? children : <Navigate to="/auth" replace />;
}
