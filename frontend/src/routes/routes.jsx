import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from '../AuthPages/Signup.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
 
import OTPVerification from '../AuthPages/Otp.jsx';
import VerifiedRoute from '../components/VerifyRoute.jsx';
import { ToastContainer } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../AuthPages/ResetPassword.jsx';
import ForgotPassword from '../AuthPages/ForgotPassword.jsx';
import Login from '../AuthPages/login.jsx';
import UnverifiedHome from '../AuthPages/UnverifiedHome.jsx';
import Home from '../../WebPages/Home.jsx';

const AppRoutes = () => {
  return (
   <BrowserRouter>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Protected Routes - Require Login */}
                <Route element={<ProtectedRoute />}>
                    {/* Routes that require verification */}
                    <Route element={<VerifiedRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        {/* Add other verified-only routes here */}
                    </Route>
                    
                    {/* Routes accessible without verification */}
                    <Route path="/unverified-home" element={<UnverifiedHome />} />
                    {/* Add other unverified routes here */}
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
  );
};

export default AppRoutes;