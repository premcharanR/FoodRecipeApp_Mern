import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLoginPage.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin-login"); 
      return;
    }
    
    const token = localStorage.getItem("adminToken");
    if(token){
      navigate("/admin-panel");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const passwordInput = document.getElementById("password");

    const handlePasswordFocus = () => setIsTypingPassword(true);
    const handlePasswordBlur = () => setIsTypingPassword(false);

    passwordInput.addEventListener("focus", handlePasswordFocus);
    passwordInput.addEventListener("blur", handlePasswordBlur);

    return () => {
      passwordInput.removeEventListener("focus", handlePasswordFocus);
      passwordInput.removeEventListener("blur", handlePasswordBlur);
    };
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("adminToken", response.data.token);

        window.location.replace("/admin-panel");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-login-page">
      <h2>Admin Login</h2>
      <div className={`monkey ${isTypingPassword ? "closed-eyes" : "open-eyes"}`}>
        <svg className="monkey-face" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="100" fill="#a9ddf3" />
          <g className="eyeL"><circle cx="85.5" cy="78.5" r="8" fill="#3a5e77" /></g>
          <g className="eyeR"><circle cx="114.5" cy="78.5" r="8" fill="#3a5e77" /></g>
          <g className="mouth"><path d="M85 110 Q100 130 115 110" stroke="#3a5e77" strokeWidth="4" fill="none" /></g>
        </svg>
      </div>
      <form onSubmit={handleAdminLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
