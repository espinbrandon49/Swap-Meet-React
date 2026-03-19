import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import AuthFormShell from "../components/AuthFormShell";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const isValid = useMemo(() => {
    return username.trim().length > 0 && password.length > 0;
  }, [username, password]);

  const handleRegister = async () => {
    if (!isValid || submitting) return;

    try {
      setSubmitting(true);
      const cleanUsername = username.trim();

      await api.post("/api/users", {
        username: cleanUsername,
        password,
      });

      await login(cleanUsername, password);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-page__grid">
        <div>
          <AuthFormShell
            title="Create Account"
            username={username}
            password={password}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleRegister}
            submitLabel={submitting ? "Creating Account..." : "Create Account"}
          />

          <div className="auth-page__aside">
            Already have an account?{" "}
            <Link to="/login" className="btn-link-ui">
              Sign in here
            </Link>
            .
          </div>
        </div>

        <section className="card-ui auth-page__feature">
          <div className="auth-page__intro">
            <small>Account setup</small>
            <h1 className="auth-page__title">Create your storefront account</h1>
            <p className="text-muted auth-page__copy">
              Sign up to create categories, add listings, manage your storefront,
              and share your public pages.
            </p>
          </div>

          <div className="auth-info-grid">
            <AuthInfoCard
              label="Create"
              value="Account"
              note="Set up your username and password."
            />
            <AuthInfoCard
              label="Build"
              value="Listings"
              note="Create categories and add products in your dashboard."
            />
            <AuthInfoCard
              label="Share"
              value="Storefront"
              note="Share your public storefront and category pages."
            />
          </div>

          <div className="auth-page__cta-box">
            <div>
              <h2 className="auth-page__cta-title">Get started</h2>
            </div>

            <ul className="auth-page__list">
              <li>Your account signs in automatically after registration.</li>
              <li>You can start managing your storefront right away.</li>
              <li>Your dashboard and cart are available after sign-in.</li>
            </ul>

            <div className="auth-page__actions">
              <button
                type="button"
                className="btn-ui btn-primary-ui"
                onClick={handleRegister}
                disabled={!isValid || submitting}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>

              <Link to="/login" className="btn-ui btn-secondary-ui">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

function AuthInfoCard({ label, value, note }) {
  return (
    <div className="auth-info-card">
      <div className="auth-info-card__label">{label}</div>
      <div className="auth-info-card__value">{value}</div>
      <div className="auth-info-card__note">{note}</div>
    </div>
  );
}

export default Registration;