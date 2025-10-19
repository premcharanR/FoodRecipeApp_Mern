const Admin = require('../models/Admin');
const jwt = require("jsonwebtoken");
const verifyAdminToken = async (req, res, next) => {
    try {
     
      console.log('token in headers is : ',req.headers.authorization);
      const token = req.headers.authorization.split(" ")[1];
      console.log("inside the verify admin token Toke is : ",token);
      if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); 
  
      const admin = await Admin.findById(decoded.adminId); 
  
      if (!admin) {
        return res.status(403).json({ message: "Unauthorized. Admin access only." });
      }
  
      req.admin = admin; 
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };
  
  module.exports = verifyAdminToken;