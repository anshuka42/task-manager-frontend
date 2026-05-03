import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import "../App.css";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email like: example@gmail.com");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    let data = await login(email, password);

    setLoading(false);

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      setErrorMsg(data.message || "Login failed");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>
          <span className="brand">Task</span>Manager
        </h2>

        <p style={{ textAlign: "center", color: "#888", marginBottom: "20px", fontSize: "14px" }}>
          Login to your account
        </p>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Show email format error live */}
          {email && !isValidEmail(email) && (
            <p style={{ color: "#e94560", fontSize: "12px", marginTop: "4px" }}>
              ✗ Invalid email format
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
