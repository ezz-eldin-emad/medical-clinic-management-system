import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api.js";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@clinic.com", password: "Admin@123" },
  { role: "Doctor", email: "doctor@clinic.com", password: "Doctor@123" },
  { role: "Patient", email: "patient@clinic.com", password: "Patient@123" },
  { role: "Receptionist", email: "reception@clinic.com", password: "Reception@123" }
];



export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(email, password);

      if (response.success && response.data) {
        const redirectPath = response.data.redirectTo || "/patient/dashboard";
        navigate(redirectPath);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleLoginSubmit}>
        <h2>Welcome back</h2>
        <p className="form-subtitle">
          Enter your credentials to access your account.
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}
          >
            {error}
          </div>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="btn-primary">
          Continue
        </button>
      </form>

      <div className="demo-accounts">
        <div className="demo-accounts-title">
          <span>Demo accounts</span>
          <span>Click to fill</span>
        </div>
        {DEMO_ACCOUNTS.map((account) => (
          <button
            type="button"
            key={account.role}
            className="demo-account"
            onClick={() => {
              setEmail(account.email);
              setPassword(account.password);
              setError("");
            }}
          >
            <span className="demo-role">{account.role}</span>
            <span className="demo-email">{account.email}</span>
            <span className="demo-password">{account.password}</span>
          </button>
        ))}
      </div>
    </>
  );
}
