import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UnverifiedHome = () => {
    const [user, setUser] = useState(null);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // If user is somehow verified, redirect them
            if (parsedUser.isVerified) {
                navigate('/home');
            } else {
                setUser(parsedUser);
            }
        } else {
            // If no user, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleResendVerification = async () => {
        if (!user?.email) {
            toast.error('Could not find user email. Please log in again.');
            return;
        }
        setIsResending(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
                email: user.email
                
            });
            toast.success('A new verification email has been sent. Please check your inbox and enter the OTP here.');
            navigate('/verify-otp', { state: { email: user.email, firstName: user.firstName } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setIsResending(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">MyApp</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Please Verify Your Email
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                    Welcome, {user.firstName}! A verification link has been sent to your email address: <strong>{user.email}</strong>. Please check your inbox (and spam folder) to complete your registration.
                </p>
                <div className="mt-8">
                    <button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition"
                    >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnverifiedHome;