import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";
import "../App.css";


function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


function getPasswordError(password) {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(password)) return "Password must have at least one uppercase letter (A-Z)";
  if (!/[0-9]/.test(password)) return "Password must have at least one number (0-9)";
  return null;
}

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  
  const passwordError = password ? getPasswordError(password) : null;
  const passwordStrong = password && !passwordError;

  async function handleSignup() {
    if (!name || !email || !password) {
      setErrorMsg("Please fill all fields");
      return;
    }

    
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email like: example@gmail.com");
      return;
    }

    
    const pwdErr = getPasswordError(password);
    if (pwdErr) {
      setErrorMsg(pwdErr);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    let data = await signup(name, email, password, role);

    setLoading(false);

    if (data.message === "Account created successfully!") {
      setSuccessMsg("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setErrorMsg(data.message || "Signup failed");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>
          <span className="brand">Task</span>Manager
        </h2>

        <p style={{ textAlign: "center", color: "#888", marginBottom: "20px", fontSize: "14px" }}>
          Create a new account
        </p>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Show email error live */}
          {email && !isValidEmail(email) && (
            <p style={{ color: "#e94560", fontSize: "12px", marginTop: "4px" }}>
              ✗ Invalid email format
            </p>
          )}
          {email && isValidEmail(email) && (
            <p style={{ color: "#27ae60", fontSize: "12px", marginTop: "4px" }}>
              ✓ Valid email
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Min 6 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Show password strength live */}
          {password && (
            <p
              style={{
                color: passwordStrong ? "#27ae60" : "#e94560",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {passwordStrong ? "✓ Strong password" : `✗ ${passwordError}`}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
