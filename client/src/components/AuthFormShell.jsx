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
    <div className="auth-shell">
      <div className="card-ui">
        <h2 className="auth-shell__title">{title}</h2>

        <div className="auth-shell__form">
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