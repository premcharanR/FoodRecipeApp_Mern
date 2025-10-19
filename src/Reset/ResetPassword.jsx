import React, { useState } from "react";
import axios from "axios";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState("");

  const handleRequestOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2); 
    } catch (err) {
      setMessage(err.response.data.message || "Error requesting OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { email, otp, newPassword });
      setMessage(res.data.message);
      setStep(3); 
    } catch (err) {
      setMessage(err.response.data.message || "Error resetting password");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Reset Password</h2>

        {step === 1 && (
          <>
            <input 
              type="email" 
              className="reset-password-input" 
              placeholder="Enter your email" 
              value={email}  
              onChange={(e) => setEmail(e.target.value)} 
            />
            <button className="reset-password-button" onClick={handleRequestOTP}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input 
              type="text" 
              className="reset-password-input" 
              placeholder="Enter OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <input 
              type="password" 
              className="reset-password-input" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button className="reset-password-button" onClick={handleResetPassword}>
              Reset Password
            </button>
          </>
        )}

        {step === 3 && <p className="success-message">Password reset successful! You can now login.</p>}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
