// src/pages/PageNotFound.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const PageNotFound = () => {
  const location = useLocation();

  return (
    <div className="container" style={{ maxWidth: "980px" }}>
      <div
        className="card-ui"
        style={{
          padding: "32px",
          display: "grid",
          gap: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "grid", gap: "10px" }}>
          <small>Routing fallback</small>
          <h1
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: 1,
            }}
          >
            404
          </h1>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: 1.15,
            }}
          >
            This page could not be found
          </h2>
          <p
            className="text-muted"
            style={{
              margin: 0,
              maxWidth: "680px",
              marginInline: "auto",
              lineHeight: 1.7,
            }}
          >
            The route you tried to open does not exist in this marketplace build,
            may have been removed, or may have been entered incorrectly.
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e4dccf",
            borderRadius: "18px",
            background: "#fcfaf6",
            padding: "18px",
            maxWidth: "720px",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gap: "10px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#6b645b",
            }}
          >
            Requested path
          </div>
          <code
            style={{
              display: "block",
              fontSize: "15px",
              color: "#1f1f1f",
              wordBreak: "break-word",
              background: "#f4efe7",
              border: "1px solid #ddd4c7",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            {location.pathname}
          </code>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
            gap: "14px",
          }}
        >
          <RouteHintCard
            label="Browse"
            value="Home"
            note="Return to the marketplace landing page."
          />
          <RouteHintCard
            label="Shop"
            value="Categories"
            note="Navigate through category and product routes."
          />
          <RouteHintCard
            label="Account"
            value="Login"
            note="Access protected buyer and seller views."
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" className="btn-ui btn-primary-ui">
            Back to Home
          </Link>

          <Link to="/login" className="btn-ui btn-secondary-ui">
            Go to Login
          </Link>

          <Link to="/registration" className="btn-ui btn-secondary-ui">
            Create Account
          </Link>
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#6b645b",
          }}
        >
          ¯\_(ツ)_/¯
        </div>
      </div>
    </div>
  );
};

function RouteHintCard({ label, value, note }) {
  return (
    <div
      style={{
        border: "1px solid #e4dccf",
        borderRadius: "16px",
        background: "#ffffff",
        padding: "18px",
        display: "grid",
        gap: "8px",
        textAlign: "left",
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

export default PageNotFound;