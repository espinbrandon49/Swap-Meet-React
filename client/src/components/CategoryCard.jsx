import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  if (!category) return null;

  const ownerName = category.owner?.username || category.username || "Storefront";

  const productCount = Array.isArray(category.products)
    ? category.products.length
    : 0;

  return (
    <div className="card-ui">
      <div className="category-card__body">
        <small>{ownerName}</small>

        <h3 className="category-card__title">
          {category.category_name || "Category"}
        </h3>

        <p className="text-muted mb-0">
          {productCount} item{productCount === 1 ? "" : "s"}
        </p>

        <div className="category-card__footer">
          <Link to={`/category/${category.id}`} className="btn-ui btn-primary-ui">
            View Category
          </Link>
        </div>
      </div>
    </div>
  );
}