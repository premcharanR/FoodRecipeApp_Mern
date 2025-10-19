const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); 

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(403).json({ message: "Unauthorized. Admin access only." });
    }

    req.admin = admin; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token.", error: error.message });
  }
};

module.exports = verifyAdmin;
