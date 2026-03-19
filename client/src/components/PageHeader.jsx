import React from "react";

export default function PageHeader({
  title,
  subtitle = "",
  meta = "",
  right = null,
}) {
  return (
    <div className="page-header">
      <div>
        <h2 style={{ marginBottom: "4px", marginTop: 0 }}>
          {title}
        </h2>

        {subtitle ? <small>{subtitle}</small> : null}
      </div>

      {(meta || right) ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {meta ? <div className="text-muted">{meta}</div> : null}
          {right}
        </div>
      ) : null}
    </div>
  );
}