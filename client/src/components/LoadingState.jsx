import React from "react";

export default function EmptyState({
  title,
  message = "",
  action = null,
  className = "",
}) {
  return (
    <div className={`card-ui text-center ${className}`.trim()}>
      <h3 className="state-card__title">{title}</h3>

      {message ? (
        <p className="text-muted state-card__message">{message}</p>
      ) : null}

      {action ? <div className="state-card__action">{action}</div> : null}
    </div>
  );
}