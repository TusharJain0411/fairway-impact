import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, ArrowRight } from "lucide-react";

import { clearAuthError, loginUser } from "../features/auth/authSlice";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await dispatch(loginUser(formData)).unwrap();

      navigate(result.user.isAdmin ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch {
      // Error is already stored in Redux and shown below.
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <Link to="/" className="login-logo">
          Fairway<span>Impact</span>
        </Link>

        <div className="brand-content">
          <p className="login-eyebrow">PLAY WITH PURPOSE</p>
          <h1>Every score can make a difference.</h1>
          <p>
            Track your golf journey, support meaningful causes, and get rewards
            for playing the sport you love.
          </p>
        </div>

        <p className="brand-footer">© 2026 Fairway Impact</p>
      </section>

      <section className="login-form-section">
        <div className="login-box">
          <Link to="/" className="back-home">
            ← Back to home
          </Link>

          <div className="form-heading">
            <p className="login-eyebrow">WELCOME BACK</p>
            <h4>Log in to your account</h4>
            <p>Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-group">
              <Mail size={19} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-group">
              <Lock size={19} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="auth-form-error">{error}</p>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="create-account">
            New to Fairway Impact? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
