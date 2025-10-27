import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SignUp.css";

const SignUp = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    toast(message, { type, position: "top-right", autoClose: 3000 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    

    if (!userData.name || !userData.email || !userData.phone || !userData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/signup", userData);
      showToast("OTP sent to email. Check your inbox.");
      setStep(2);
    } catch (error) {
      showToast(error.response?.data?.message || "Signup failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email: userData.email, otp });
      showToast("Email verified! You can now login.");
      navigate("/");
    } catch (error) {
      showToast(error.response?.data?.message || "OTP verification failed", "error");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {step === 1 ? (
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" value={userData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={userData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={userData.phone} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={userData.password} onChange={handleChange} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div className="input-group">
            <label>Enter OTP</label>
            <input type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
      )}
    </div>
  );
};

export default SignUp;