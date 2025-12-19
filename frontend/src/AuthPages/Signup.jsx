import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const Signup = () => {
    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        DOB: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const navigator = useNavigate();

    // Password strength checker
    useEffect(() => {
        const calculateStrength = () => {
            let strength = 0;
            if (data.password.length >= 6) strength += 25;
            if (/[A-Z]/.test(data.password)) strength += 25;
            if (/[0-9]/.test(data.password)) strength += 25;
            if (/[^A-Za-z0-9]/.test(data.password)) strength += 25;
            setPasswordStrength(strength);
        };
        
        calculateStrength();
    }, [data.password]);

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
        // Clear error for this field when user starts typing
        if (formErrors[input.name]) {
            setFormErrors(prev => ({ ...prev, [input.name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const today = new Date();
        const dobDate = new Date(data.DOB);
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 100); // 100 years ago
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 13); // Minimum 13 years old

        if (!data.firstName.trim()) errors.firstName = 'First name is required';
        if (!data.lastName.trim()) errors.lastName = 'Last name is required';
        
        if (!data.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.DOB) {
            errors.DOB = 'Date of birth is required';
        } else if (dobDate > maxDate) {
            errors.DOB = 'You must be at least 13 years old';
        } else if (dobDate < minDate) {
            errors.DOB = 'Please enter a valid date of birth';
        }
        
        if (!data.password) {
            errors.password = 'Password is required';
        } else if (data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (!data.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            const url = `${import.meta.env.VITE_API_URL}/auth/register`;
            
            // Create a new object with the trimmed email
            const dataToSend = {
                ...data,
                email: data.email.trim(),
            };
            // Remove confirmPassword from the object to be sent
            delete dataToSend.confirmPassword;

            const { data: res } = await axios.post(url, dataToSend);
            
            toast.success("🎉 Account created! OTP sent to your email.");
            
            // Add a small delay for better UX
            setTimeout(() => {
                navigator('/verify-otp', { 
                    state: { 
                        email: data.email,
                        firstName: data.firstName 
                    } 
                });
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response?.status >= 400 && error.response?.status <= 500) {
                const errorMessage = error.response.data?.message || "Registration failed!";
                toast.error(errorMessage);
                setFormErrors({ general: errorMessage });
            } else {
                toast.error("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm"
            >
                {/* Left Side - Branding/Info */}
                <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-12 text-white">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold">SecureAuth</span>
                            </div>
                            
                            <h1 className="text-3xl font-bold mb-4">Join Our Community</h1>
                            <p className="text-blue-100 mb-8">
                                Create your account and unlock access to exclusive features, personalized content, and a secure platform designed for you.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Secure & Private</h3>
                                    <p className="text-sm text-blue-100">End-to-end encryption and privacy protection</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Free Forever</h3>
                                    <p className="text-sm text-blue-100">No hidden fees, no subscription required</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">24/7 Support</h3>
                                    <p className="text-sm text-blue-100">Round-the-clock customer assistance</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-3/5 p-8 md:p-12">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                            <p className="text-gray-600 mt-2">Fill in your details to get started</p>
                        </motion.div>

                        {formErrors.general && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <p className="text-red-600 text-center font-medium">{formErrors.general}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={data.firstName}
                                            onChange={handleChange}
                                            required
                                            autoComplete="given-name"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {formErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={data.lastName}
                                            onChange={handleChange}
                                            required
                                            autoComplete="family-name"
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {formErrors.lastName && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                    )}
                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="date"
                                        name="DOB"
                                        value={data.DOB}
                                        onChange={handleChange}
                                        required
                                        autoComplete="bday"
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.DOB ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </div>
                                {formErrors.DOB && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.DOB}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
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
                                        value={data.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="••••••••"
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
                                {data.password && (
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
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                                transition={{ duration: 0.5 }}
                                                className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={data.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
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
                                {formErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isLoading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Create Account
                                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="text-center pt-4 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <Link 
                                        to="/login" 
                                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;