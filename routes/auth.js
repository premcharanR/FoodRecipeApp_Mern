
const sendOTPEmail = require("../utils/emailUtils");
const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); 
const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStorage = {};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "premcharanpremcharan335@gmail.com",
    pass: "pgni xywk thpr gvqy",
  },
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; 

    
    otpStorage[email] = { otp, expiresAt };


    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!otpStorage[email]) {
    return res.status(400).json({ message: "OTP not requested or expired" });
  }

  const storedOTP = otpStorage[email];

  
  if (storedOTP.otp !== otp || Date.now() > storedOTP.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

   
    delete otpStorage[email];

    res.status(200).json({ message: "Password reset successful!" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/signup", async (req, res) => {
    const { name, email, phone, password } = req.body;
  
    try {
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 
  
      const newUser = new User({
        name,
        email,
        phone,
        password,
        otp,
        otpExpiry,
        isVerified: false,
      });
  
      await newUser.save();
      await sendOTPEmail(email, otp);
  
      res.status(201).json({ message: "OTP sent to email. Please verify." });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) return res.status(400).json({ message: "User not found" });
  
      if (user.isVerified) return res.status(400).json({ message: "User already verified" });
  
      if (!user.otp || user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      if (new Date() > user.otpExpiry) {
        return res.status(400).json({ message: "OTP expired. Please sign up again." });
      }
  
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
  
      res.status(200).json({ message: "OTP verified successfully. You can now login." });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

   
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || "your_secret_key", 
            { expiresIn: "1h" }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,  
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            res.status(500).json({ message: "Logout failed" });
        } else {
            res.status(200).json({ message: "Logout successful" }); 
        }
    });
});


module.exports = router;
