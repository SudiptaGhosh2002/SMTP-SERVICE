import { sendVerificationCode, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from "../middleware/Email.js";
import { Usermodel } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const register = async (req, res) => {
    try { 
        const { firstName, lastName, password, DOB } = req.body;
        const email = req.body.email ? req.body.email.trim() : null;

         if(!firstName || !lastName || !email || !password || !DOB){
            return  res.status(400).json({ message: 'All fields are required' });
        }
        // Check if user already exists

        const existingUser = await Usermodel.findOne({ email });
       
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        //hash password
        const passwordHash = await bcrypt.hash(password, 10);

        //make a random 6 digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        //create a new user
        const newUser = new Usermodel({ 
            firstName, 
            lastName, 
            email, 
            password: passwordHash, 
            DOB, 
            verificationCode,
            verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
        });
        await newUser.save();
        
        // Send verification email
        await sendVerificationCode(newUser.email, verificationCode, firstName);

        // Prepare user object for response, excluding sensitive data
        const userObject = newUser.toObject();
        delete userObject.password;
        delete userObject.verificationCode;
        delete userObject.verificationCodeExpires;

        console.log('User registered successfully');
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully. Please check your email for verification code.',
            user: userObject 
        });
    }catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }   
};

const verifyEmail = async (req, res) => {
    try { 
        const { verificationCode } = req.body;
        const email = req.body.email ? req.body.email.trim() : null;
        
        if(!email || !verificationCode){
            return res.status(400).json({ 
                success: false,
                message: 'Email and verification code are required' 
            });
        }
        
        // Find user by email and verification code
        const user = await Usermodel.findOne({ 
            email, 
            verificationCode,
            verificationCodeExpires: { $gt: new Date() } // Check if code hasn't expired
        });
        
        if (!user) {
            // Check if user exists but code is expired
            const userWithExpiredCode = await Usermodel.findOne({ 
                email, 
                verificationCode 
            });
            
            if (userWithExpiredCode) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Verification code has expired. Please request a new one.' 
                });
            }
            
            return res.status(400).json({ 
                success: false,
                message: 'Invalid verification code or email' 
            });
        }
        
        // Update user verification status
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        user.verifiedAt = new Date();
        await user.save();
        
        // Send welcome email
        await sendWelcomeEmail(user.email, user.firstName);
        
        // Prepare response
        const userObject = user.toObject();
        delete userObject.password;
        delete userObject.verificationCode;
        delete userObject.verificationCodeExpires;
        
        console.log('Email verified successfully for:', email);
        
        res.status(200).json({ 
            success: true,
            message: 'Email verified successfully',
            user: userObject 
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during verification' 
        });
    }
};

const resendVerificationCode = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim() : null;
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required' 
            });
        }
        
        // Find user by email
        const user = await Usermodel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found. Please register first.' 
            });
        }
        
        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is already verified' 
            });
        }
        
        // Check if user can request a new code (prevent spam)
        const now = new Date();
        const lastRequest = user.lastVerificationRequest || new Date(0);
        const timeSinceLastRequest = now - lastRequest;
        
        // Minimum 1 minute wait between requests
        if (timeSinceLastRequest < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - timeSinceLastRequest) / 1000);
            return res.status(429).json({ 
                success: false,
                message: `Please wait ${waitSeconds} seconds before requesting a new code` 
            });
        }
        
        // Generate new verification code
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update user with new verification code
        user.verificationCode = newVerificationCode;
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
        user.lastVerificationRequest = new Date();
        await user.save();
        
        // Send new verification email
        await sendVerificationCode(user.email, newVerificationCode, user.firstName);
        
        console.log('New verification code sent to:', email);
        
        res.status(200).json({ 
            success: true,
            message: 'New verification code sent to your email',
            expiresIn: 15 // minutes
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while resending verification code' 
        });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email ? req.body.email.trim() : null;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await Usermodel.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWTPRIVATEKEY,
            { expiresIn: '7d' }
        );

        // Prepare user data for response
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isVerified: user.isVerified,
            DOB: user.DOB,
            createdAt: user.createdAt
        };

        console.log(`User logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// Check authentication status
const checkAuth = async (req, res) => {
    try {
        // This middleware should be used with authenticateToken middleware
        // which will add user data to req.user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                isAuthenticated: false,
                message: "Not authenticated"
            });
        }

        const user = await Usermodel.findById(req.user.userId).select('-password -verificationCode -passwordResetToken -passwordResetExpires');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                isAuthenticated: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            isAuthenticated: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
                DOB: user.DOB,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Check auth error:", error);
        res.status(500).json({
            success: false,
            isAuthenticated: false,
            message: "Server error"
        });
    }
};

// Logout (client-side only, but can be added for server-side token blacklisting)
const logout = (req, res) => {
    // For JWT, logout is handled client-side by removing the token
    // But we can add token blacklisting if needed
    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim() : null;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user by email
        const user = await Usermodel.findOne({ email });
        
        // Always return success even if user not found (for security)
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first before resetting password"
            });
        }

        // Rate limiting: Check last request time
        const now = new Date();
        if (user.lastPasswordResetRequest) {
            const timeSinceLastRequest = now - new Date(user.lastPasswordResetRequest);
            const minTimeBetweenRequests = 2 * 60 * 1000; // 2 minutes
            
            if (timeSinceLastRequest < minTimeBetweenRequests) {
                const waitSeconds = Math.ceil((minTimeBetweenRequests - timeSinceLastRequest) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitSeconds} seconds before requesting another password reset`
                });
            }
        }

        // Check reset attempts
        if (user.passwordResetAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many password reset attempts. Please try again later or contact support"
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token for database storage
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expiry (1 hour)
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
        user.lastPasswordResetRequest = now;
        
        await user.save();

        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.firstName);
            
            console.log(`Password reset email sent to: ${user.email}`);
            
            res.status(200).json({
                success: true,
                message: "Password reset link sent to your email"
            });
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
            
            // Clear reset token if email failed
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            
            res.status(500).json({
                success: false,
                message: "Failed to send password reset email. Please try again later."
            });
        }

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during password reset request"
        });
    }
};

// Reset Password - Validate token
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required"
            });
        }

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await Usermodel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        res.status(200).json({
            success: true,
            message: "Token is valid",
            email: user.email
        });

    } catch (error) {
        console.error("Validate reset token error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Reset Password - Set new password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await Usermodel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Update user password and clear reset token
        user.password = passwordHash;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetAttempts = 0;
        user.lastPasswordResetRequest = undefined;
        
        await user.save();

        // Send password changed email
        try {
            await sendPasswordChangedEmail(user.email, user.firstName);
        } catch (emailError) {
            console.error("Failed to send password changed email:", emailError);
            // Don't fail the request if email fails
        }

        console.log(`Password reset successful for: ${user.email}`);
        
        res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during password reset"
        });
    }
};

// Change Password (logged in user)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.userId; // Changed from req.user?._id to req.user?.userId
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        // Find user
        const user = await Usermodel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Check if new password is same as old
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as current password"
            });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Update password
        user.password = passwordHash;
        await user.save();

        // Send password changed email
        try {
            await sendPasswordChangedEmail(user.email, user.firstName);
        } catch (emailError) {
            console.error("Failed to send password changed email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const checkVerificationStatus = async (req, res) => {
    try {
        const email = req.query.email ? req.query.email.trim() : null;
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required' 
            });
        }
        
        const user = await Usermodel.findOne({ email }).select('-password -verificationCode -passwordResetToken');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            isVerified: user.isVerified,
            email: user.email,
            firstName: user.firstName
        });
    } catch (error) {
        console.error('Check verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

export { 
    register, 
    verifyEmail, 
    resendVerificationCode, 
    login,
    checkAuth, // This was missing - now defined above
    logout,
    forgotPassword,
    validateResetToken,
    resetPassword,
    changePassword,
    checkVerificationStatus
};