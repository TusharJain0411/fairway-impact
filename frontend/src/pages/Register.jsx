import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

import { clearAuthError, registerUser } from "../features/auth/authSlice";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
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
      await dispatch(registerUser(formData)).unwrap();

      navigate("/register-success", { replace: true });
    } catch {
      // Error is already stored in Redux and shown below.
    }
  };

  return (
    <main className="register-page">
      <section className="register-brand">
        <Link to="/" className="register-logo">
          Fairway<span>Impact</span>
        </Link>

        <div className="register-brand-content">
          <p className="register-eyebrow">PLAY WITH PURPOSE</p>
          <h1>Join the movement, one round at a time.</h1>
          <p>
            Your membership supports charities while giving you access to
            monthly rewards and your golf performance dashboard.
          </p>
        </div>

        <p className="register-footer">© 2026 Fairway Impact</p>
      </section>

      <section className="register-form-section">
        <div className="register-box">
          <Link to="/" className="register-back-home">
            ← Back to home
          </Link>

          <div className="register-heading">
            <p className="register-eyebrow">CREATE ACCOUNT</p>
            <h4>Start your impact journey</h4>
            <p>Create your account in just a few seconds.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full name</label>
            <div className="register-input-group">
              <User size={19} />
              <input
                id="fullName"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="email">Email address</label>
            <div className="register-input-group">
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
            <div className="register-input-group">
              <Lock size={19} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="auth-form-error">{error}</p>}

            <button
              type="submit"
              className="register-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="already-account">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
