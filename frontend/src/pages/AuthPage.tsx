import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  // const location = useLocation();

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, [mode]);

  useEffect(() => {
    if (sessionStorage.getItem("justLoggedOut")) {
      sessionStorage.removeItem("justLoggedOut");
      setToast({ message: "Logged out successfully", variant: "success" });
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    // setFormError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setToast({ message: mode === "login" ? "Logged in successfully" : "Account created successfully", variant: "success" });
      setTimeout(() => navigate("/parts"), 700);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Parts Marketplace</p>
        <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="hint">Enter a valid email address</span>

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <span className="hint">Minimum 6 characters</span>

          {/* {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )} */}

          {toast && <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />}
  
          <button type="submit" disabled={!isValid || submitting}>
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="switch-link">
          {mode === "login" ? (
            <>
              No account? <Link to="/register">Create one</Link>
            </>
          ) : (
            <>
              Have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
      {toast && <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />}
    </div>
  );
}
