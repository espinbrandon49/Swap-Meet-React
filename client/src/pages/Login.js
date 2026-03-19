import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import AuthFormShell from "../components/AuthFormShell";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const isValid = useMemo(() => {
    return username.trim().length > 0 && password.length > 0;
  }, [username, password]);

  const handleLogin = async () => {
    if (!isValid || submitting) return;

    try {
      setSubmitting(true);
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleLogin();
    }
  };

  return (
    <div className="container auth-page" onKeyDown={handleKeyDown}>
      <div className="auth-page__grid">
        <div>
          <AuthFormShell
            title="Sign In"
            username={username}
            password={password}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            submitLabel={submitting ? "Signing In..." : "Sign In"}
          />

          <div className="auth-page__aside">
            Need an account?{" "}
            <Link to="/registration" className="btn-link-ui">
              Create one here
            </Link>
            .
          </div>
        </div>

        <section className="card-ui auth-page__feature">
          <div className="auth-page__intro">
            <small>Account access</small>
            <h1 className="auth-page__title">Return to your storefront</h1>
            <p className="text-muted auth-page__copy">
              Sign in to manage your listings, review your cart, and continue
              browsing across storefronts and categories.
            </p>
          </div>

          <div className="auth-info-grid">
            <AuthInfoCard
              label="Dashboard"
              value="Manage"
              note="Create and update categories and products."
            />
            <AuthInfoCard
              label="Cart"
              value="Review"
              note="Check selected items and totals."
            />
            <AuthInfoCard
              label="Storefront"
              value="Browse"
              note="Open your public storefront and category pages."
            />
          </div>

          <div className="auth-page__cta-box">
            <div>
              <h2 className="auth-page__cta-title">Sign in</h2>
            </div>

            <ul className="auth-page__list">
              <li>Use your existing storefront name and password.</li>
              <li>Your cart and dashboard are protected.</li>
              <li>After login, you’ll return to the home page.</li>
            </ul>

            <div className="auth-page__actions">
              <button
                type="button"
                className="btn-ui btn-primary-ui"
                onClick={handleLogin}
                disabled={!isValid || submitting}
              >
                {submitting ? "Signing In..." : "Sign In"}
              </button>

              <Link to="/registration" className="btn-ui btn-secondary-ui">
                Create Account
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

export default Login;