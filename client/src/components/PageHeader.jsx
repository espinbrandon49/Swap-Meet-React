import React from "react";

export default function PageHeader({
  title,
  subtitle = "",
  meta = "",
  right = null,
}) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <h2 className="page-header__title">{title}</h2>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>

      {(meta || right) ? (
        <div className="page-header__meta">
          {meta ? <div className="page-header__meta-text">{meta}</div> : null}
          {right}
        </div>
      ) : null}
    </div>
  );
}