import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Format DOB for display
    const formatDOB = (dob) => {
        if (!dob) return 'Not set';
        try {
            const date = new Date(dob);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dob; // Return as-is if can't parse
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-800">MyApp</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, {user.firstName}!
                            </span>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-blue-600">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Your account is fully verified and ready to use.
                        </p>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium">{formatDOB(user.DOB)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Account Status</p>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="font-medium text-green-600">Verified</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="font-medium">
                                    {new Date(user.createdAt || new Date()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">User ID</p>
                                <p className="font-medium text-sm truncate">{user._id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Feature 1</h3>
                            <p className="text-blue-700">
                                Access all premium features with your verified account.
                            </p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Feature 2</h3>
                            <p className="text-green-700">
                                Enjoy enhanced security and full access to all tools.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-purple-800 mb-2">Feature 3</h3>
                            <p className="text-purple-700">
                                Connect with other verified users in the community.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;