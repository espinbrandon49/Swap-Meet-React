import React from "react";

export default function AuthFormShell({
  title,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  submitLabel,
}) {
  return (
    <div className="container login-page">
      <div
        className="card-ui"
        style={{
          maxWidth: "420px",
          margin: "48px auto 0",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>{title}</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <input
            autoComplete="off"
            className="input-ui"
            placeholder="Store Name"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />

          <input
            autoComplete="off"
            type="password"
            className="input-ui"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />

          <button className="btn-ui btn-primary-ui" onClick={onSubmit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}