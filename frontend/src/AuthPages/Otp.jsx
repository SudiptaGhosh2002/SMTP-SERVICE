import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from location state OR localStorage
    useEffect(() => {
        // First try to get email from location state
        const locationState = location.state || {};
        if (locationState.email) {
            setEmail(locationState.email);
        } else {
            // If not in location state, try to get from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser.email) {
                        setEmail(parsedUser.email);
                    }
                } catch (error) {
                    console.error('Error parsing user from localStorage:', error);
                }
            }
        }
    }, [location.state]);

    // Timer countdown
    useEffect(() => {
        let interval;
        if (timer > 0 && isResendDisabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsResendDisabled(false);
        }
        return () => clearInterval(interval);
    }, [timer, isResendDisabled]);

    // Redirect after success
    useEffect(() => {
        if (verificationSuccess) {
            const redirectTimer = setTimeout(() => {
                navigate('/login');
            }, 3000);

            return () => clearTimeout(redirectTimer);
        }
    }, [verificationSuccess, navigate]);

    const handleChange = (index, value) => {
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handlePaste(e);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6);

        if (pastedNumbers.length === 6) {
            const newOtp = pastedNumbers.split('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const otpString = otp.join('');
        
        // Validate OTP
        if (otpString.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        if (!email) {
            toast.error('Email not found. Please sign up again.');
            return;
        }

        setIsVerifying(true);

        try {
            console.log('Sending verification request for email:', email);
            
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
                email: email,
                verificationCode: otpString
            });

            console.log('Verification response:', response.data);

            if (response.data.success) {
                toast.success('Email verified successfully! Redirecting to login...');
                setVerificationSuccess(true);
                
                // Clear OTP fields
                setOtp(['', '', '', '', '', '']);
                
                // Clear any pending verification data
                localStorage.removeItem('user');
            } else {
                toast.error(response.data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Invalid OTP';
                toast.error(errorMessage);
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            toast.error('Email not found. Please sign up again.');
            return;
        }

        try {
            console.log('Resending OTP to email:', email);
            
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
                email: email
            });

            console.log('Resend response:', response.data);

            if (response.data.success) {
                toast.success('New OTP sent to your email!');
                setTimer(60);
                setIsResendDisabled(true);
                setOtp(['', '', '', '', '', '']);
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            } else {
                toast.error(response.data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    // Format timer display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // If no email found, show error
    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't find your email address. Please sign up again or log in.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Sign Up Again
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
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Email Verification</h2>
                    <p className="text-gray-600 mt-2">
                        Enter the 6-digit code sent to
                    </p>
                    <p className="text-gray-800 font-medium mt-1">{email}</p>
                </div>

                {verificationSuccess ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Verified Successfully!</h3>
                        <p className="text-gray-600 mb-6">
                            Your email has been verified. Redirecting to login page...
                        </p>
                        <div className="flex justify-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-100"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <div className="flex justify-center space-x-2 md:space-x-3 mb-6">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                            disabled={isVerifying}
                                        />
                                    ))}
                                </div>
                                <p className="text-center text-sm text-gray-500">
                                    Enter the 6-digit verification code
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isVerifying || otp.join('').length !== 6}
                                className={`w-full py-3 rounded-lg font-semibold transition ${isVerifying || otp.join('').length !== 6
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isVerifying ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600 mb-2">
                                Didn't receive the code?{' '}
                                {isResendDisabled ? (
                                    <span className="text-gray-500">
                                        Resend in {formatTime(timer)}
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleResendOTP}
                                        disabled={isVerifying}
                                        className="text-blue-600 font-medium hover:text-blue-700 hover:underline disabled:text-gray-400"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </p>
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline block"
                                >
                                    Wrong email? Sign up again
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline block"
                                >
                                    Already verified? Login here
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OTPVerification;