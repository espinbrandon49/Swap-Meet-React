import React from "react";

export default function LoadingState({
  title = "Loading...",
  message = "",
  className = "",
}) {
  return (
    <div className={`card-ui text-center ${className}`.trim()}>
      <h3 style={{ marginTop: 0, marginBottom: "8px" }}>{title}</h3>

      {message ? (
        <p className="text-muted" style={{ marginBottom: 0 }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}