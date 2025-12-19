// middleware/auth.js
import jwt from "jsonwebtoken";

// Authentication middleware
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }

        jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }
            
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
};

// Optional: Middleware to check if user is verified
const requireVerified = (req, res, next) => {
    // This should be used after authenticateToken
    // We'll check verification status in the route handler
    next();
};

export { authenticateToken, requireVerified };