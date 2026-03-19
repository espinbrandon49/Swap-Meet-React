// src/pages/Login.js
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
    <div className="container" style={{ maxWidth: "1100px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <div>
          <AuthFormShell
            title="Sign In"
            username={username}
            password={password}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            submitLabel={submitting ? "Signing In..." : "Login"}
          />

          <div
            style={{
              maxWidth: "420px",
              margin: "16px auto 0",
              textAlign: "center",
              color: "#6b645b",
              fontSize: "14px",
            }}
          >
            Don’t have a seller account yet?{" "}
            <Link
              to="/registration"
              style={{
                color: "#7c5c3b",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one here
            </Link>
            .
          </div>
        </div>

        <section
          className="card-ui"
          style={{
            padding: "28px",
            display: "grid",
            gap: "22px",
            alignContent: "start",
            marginTop: "48px",
          }}
        >
          <div style={{ display: "grid", gap: "10px" }}>
            <small>Account access</small>
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Return to your shop and buyer tools
            </h1>
            <p
              className="text-muted"
              style={{
                margin: 0,
                maxWidth: "720px",
                lineHeight: 1.7,
              }}
            >
              Sign in to manage your storefront, maintain categories and
              products, view your cart, and continue through the marketplace
              flow from one consistent app shell.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(140px, 1fr))",
              gap: "14px",
            }}
          >
            <AuthInfoCard
              label="Seller Flow"
              value="Dashboard"
              note="Manage categories and products."
            />
            <AuthInfoCard
              label="Buyer Flow"
              value="Cart"
              note="Review selected items and totals."
            />
            <AuthInfoCard
              label="Public View"
              value="Shop"
              note="Browse storefront and category pages."
            />
          </div>

          <div
            style={{
              border: "1px solid #e4dccf",
              borderRadius: "18px",
              padding: "18px",
              background: "#fcfaf6",
              display: "grid",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Sign-in notes
              </h2>
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#5f5a52",
                lineHeight: 1.7,
              }}
            >
              <li>Use your existing store name and password.</li>
              <li>Cart and dashboard routes are protected.</li>
              <li>After login, you’ll return to the marketplace home page.</li>
            </ul>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
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

          <div
            onKeyDown={handleKeyDown}
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </section>
      </div>
    </div>
  );
};

function AuthInfoCard({ label, value, note }) {
  return (
    <div
      style={{
        border: "1px solid #e4dccf",
        borderRadius: "16px",
        background: "#fcfaf6",
        padding: "18px",
        display: "grid",
        gap: "8px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b645b",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#1f1f1f",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#5f5a52",
          lineHeight: 1.5,
        }}
      >
        {note}
      </div>
    </div>
  );
}

export default Login;