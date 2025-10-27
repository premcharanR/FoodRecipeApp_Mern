import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // useEffect(()=>{
  //   const isAuthenticated = localStorage.getItem("userId");
  //   if(isAuthenticated){
  //     navigate("/");
  //   }

  // },[navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
  
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
  
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });
  
      console.log("Token:", response.data.token);
  
      if (response.status === 200 && response.data.token) {

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", trimmedEmail);
  
        if (onLoginSuccess) {
          onLoginSuccess(response.data.token, trimmedEmail);
        }

        window.location.replace("/");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      console.error("Login Error:", err.response ? err.response.data : err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
        <button onClick={() => navigate("/reset")} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>
          Forgot Password?
        </button>
      </p>
      </form>
    
    </div>
  );
};

export default Login;
