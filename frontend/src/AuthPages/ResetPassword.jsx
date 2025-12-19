import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValidating(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/validate-reset-token/${token}`
                );

                if (response.data.success) {
                    setIsTokenValid(true);
                    setEmail(response.data.email || '');
                } else {
                    setIsTokenValid(false);
                    toast.error('Invalid or expired reset link');
                }
            } catch (error) {
                console.error('Token validation error:', error);
                setIsTokenValid(false);
                
                if (error.response?.status === 400) {
                    toast.error('Invalid or expired reset link');
                } else {
                    toast.error('Failed to validate reset link');
                }
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    // Password strength calculator
    useEffect(() => {
        const calculateStrength = () => {
            let strength = 0;
            if (formData.password.length >= 6) strength += 25;
            if (/[A-Z]/.test(formData.password)) strength += 25;
            if (/[0-9]/.test(formData.password)) strength += 25;
            if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
            setPasswordStrength(strength);
        };
        
        calculateStrength();
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordStrength < 50) {
            toast.warning('Your password is weak. Consider adding uppercase letters, numbers, or special characters.');
            // Continue anyway, just warning
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/reset-password`,
                {
                    token,
                    password: formData.password
                }
            );

            if (response.data.success) {
                toast.success('Password reset successful! You can now login with your new password.');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to reset password';
                toast.error(errorMessage);
                
                // If token is invalid, redirect to forgot password
                if (error.response.status === 400) {
                    setTimeout(() => {
                        navigate('/forgot-password');
                    }, 3000);
                }
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-200';
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-orange-500';
        if (passwordStrength <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 25) return 'Very Weak';
        if (passwordStrength <= 50) return 'Weak';
        if (passwordStrength <= 75) return 'Good';
        return 'Strong';
    };

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Validating reset link...</p>
                </div>
            </div>
        );
    }

    if (!isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Request New Reset Link
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-3xl font-bold text-gray-800">Set New Password</h2>
                        <p className="text-gray-600 mt-2">
                            Enter a new password for your account
                        </p>
                        {email && (
                            <p className="text-sm text-gray-500 mt-1">
                                Account: <span className="font-medium">{email}</span>
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Password strength meter */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Password strength:</span>
                                        <span className={`font-medium ${
                                            passwordStrength <= 25 ? 'text-red-500' :
                                            passwordStrength <= 50 ? 'text-orange-500' :
                                            passwordStrength <= 75 ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                            style={{ width: `${passwordStrength}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use at least 6 characters with uppercase, numbers, or special characters
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                />
                            </div>
                            {formData.password && formData.confirmPassword && (
                                <p className={`mt-1 text-sm ${
                                    formData.password === formData.confirmPassword 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}>
                                    {formData.password === formData.confirmPassword 
                                        ? '✓ Passwords match' 
                                        : '✗ Passwords do not match'
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !formData.password || !formData.confirmPassword}
                            className={`w-full py-3 rounded-lg font-semibold transition ${isLoading || !formData.password || !formData.confirmPassword
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Remember your password?{' '}
                            <button 
                                onClick={() => navigate('/login')}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        Password reset links expire in 1 hour for security.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;