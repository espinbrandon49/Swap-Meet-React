// src/pages/Registration.js
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
            title="Create Account"
            username={username}
            password={password}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleRegister}
            submitLabel={submitting ? "Creating Account..." : "Register"}
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#7c5c3b",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in here
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
            <small>Seller onboarding</small>
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Create your marketplace account
            </h1>
            <p
              className="text-muted"
              style={{
                margin: 0,
                maxWidth: "720px",
                lineHeight: 1.7,
              }}
            >
              Register to create your shop presence, organize products into
              categories, manage listings from the dashboard, and participate in
              the full buyer and seller marketplace flow.
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
              label="Step 1"
              value="Create"
              note="Set up your username and password."
            />
            <AuthInfoCard
              label="Step 2"
              value="Build"
              note="Add categories and products in the dashboard."
            />
            <AuthInfoCard
              label="Step 3"
              value="Share"
              note="Use your public shop and category pages."
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
                Registration notes
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
              <li>Your account signs in automatically after registration.</li>
              <li>You can begin managing your shop immediately.</li>
              <li>Protected routes unlock once the session is established.</li>
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
                onClick={handleRegister}
                disabled={!isValid || submitting}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>

              <Link to="/login" className="btn-ui btn-secondary-ui">
                Already Have an Account
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

export default Registration;