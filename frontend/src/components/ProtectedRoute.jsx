// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Verify token with backend
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/check-auth`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success && response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                    // Update stored user data if needed
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;