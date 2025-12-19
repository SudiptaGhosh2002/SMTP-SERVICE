// routes/auth.js
import express from "express";
import { 
    register, 
    verifyEmail, 
    resendVerificationCode, 
    login,
    checkAuth,
    logout,
    forgotPassword,
    resetPassword,
    validateResetToken
} from "../controllers/Auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token/:token", validateResetToken);


// Protected routes (require authentication)
router.get("/check-auth", authenticateToken, checkAuth);
router.post("/logout", authenticateToken, logout);

export default router;