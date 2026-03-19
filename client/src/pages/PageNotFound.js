import React from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const PageNotFound = () => {
  const location = useLocation();

  return (
    <div className="container page-shell-narrow">
      <div className="card-ui not-found-page">
        <div className="not-found-page__header">
          <small>Page not found</small>

          <PageHeader
            title="404"
            subtitle="This page could not be found"
          />

          <p className="text-muted not-found-page__copy">
            The route you tried to open does not exist, may have been removed,
            or may have been entered incorrectly.
          </p>
        </div>

        <div className="not-found-path-box">
          <div className="not-found-path-box__label">Requested path</div>
          <code className="not-found-path-box__value">{location.pathname}</code>
        </div>

        <div className="not-found-hint-grid">
          <RouteHintCard
            label="Browse"
            value="Home"
            note="Return to the marketplace landing page."
          />
          <RouteHintCard
            label="Shop"
            value="Categories"
            note="Navigate through category and product pages."
          />
          <RouteHintCard
            label="Account"
            value="Login"
            note="Access protected cart and shop management pages."
          />
        </div>

        <div className="not-found-actions">
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

        <div className="not-found-page__footer">¯\_(ツ)_/¯</div>
      </div>
    </div>
  );
};

function RouteHintCard({ label, value, note }) {
  return (
    <div className="not-found-hint-card">
      <div className="not-found-hint-card__label">{label}</div>
      <div className="not-found-hint-card__value">{value}</div>
      <div className="not-found-hint-card__note">{note}</div>
    </div>
  );
}

export default PageNotFound;