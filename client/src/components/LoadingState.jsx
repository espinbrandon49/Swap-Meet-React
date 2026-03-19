import React from "react";

export default function LoadingState({
  title = "Loading...",
  message = "",
  className = "",
}) {
  return (
    <div className={`card-ui text-center ${className}`.trim()}>
      <h3 className="state-card__title">{title}</h3>

      {message ? (
        <p className="text-muted state-card__message">{message}</p>
      ) : null}
    </div>
  );
}