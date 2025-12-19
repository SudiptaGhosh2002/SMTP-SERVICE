import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                { email: email.trim() }
            );

            if (response.data.success) {
                setIsSuccess(true);
                toast.success(response.data.message || 'Password reset link sent to your email');
            } else {
                toast.error(response.data.message || 'Failed to send reset link');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to send reset link';
                toast.error(errorMessage);
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
                        <p className="text-gray-600 mt-2">
                            {isSuccess 
                                ? 'Check your email for further instructions'
                                : 'Enter your email to receive a reset link'
                            }
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="you@example.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    We'll send you a link to reset your password
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 rounded-lg font-semibold transition ${isLoading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
                            <p className="text-gray-600 mb-6">
                                We've sent password reset instructions to <span className="font-medium">{email}</span>. Please check your inbox and spam folder.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    Resend Email
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Remember your password?{' '}
                            <Link 
                                to="/login" 
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Sign in here
                            </Link>
                        </p>
                        <p className="text-gray-600 mt-2">
                            Need an account?{' '}
                            <Link 
                                to="/signup" 
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        Having trouble?{' '}
                        <button 
                            onClick={() => navigate('/contact')}
                            className="underline hover:text-gray-700"
                        >
                            Contact support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;