import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  if (!category) return null;

  const ownerName =
    category.owner?.username ||
    category.username ||
    "Shop";

  const productCount = Array.isArray(category.products)
    ? category.products.length
    : 0;

  return (
    <div className="card-ui">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          height: "100%",
        }}
      >
        <small>{ownerName}</small>

        <h3 style={{ margin: 0 }}>
          {category.category_name || "Category"}
        </h3>

        <p className="text-muted" style={{ margin: 0 }}>
          {productCount} item{productCount === 1 ? "" : "s"}
        </p>

        <div style={{ marginTop: "auto" }}>
          <Link
            to={`/category/${category.id}`}
            className="btn-ui btn-primary-ui"
          >
            View Category
          </Link>
        </div>
      </div>
    </div>
  );
}