const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("🚨 Unauthorized: No token provided");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; 
        console.log("🔑 Token received:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("📜 Decoded JWT payload:", decoded);

        if (!decoded.userId) {
            console.error("🚨 Unauthorized: Invalid token payload (missing userId)");
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            console.error("🚨 Unauthorized: User not found");
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        console.log("✅ User authenticated:", req.user._id);

        next();
    } catch (err) {
        console.error("🚨 Token verification failed:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        } else {
            return res.status(401).json({ message: "Unauthorized: Authentication failed" });
        }
    }
};

module.exports = authenticateUser;
