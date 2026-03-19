import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product,
  onQuickAdd,
  busy = false,
  showCategory = true,
  showQuickAdd = false,
}) {
  const navigate = useNavigate();

  if (!product) return null;

  const imgSrc = product.image_url || "https://picsum.photos/400/300";
  const price = Number(product.price || 0).toFixed(2);

  return (
    <div className="card-ui">
      <div className="product-card__image-wrap">
        <img
          src={imgSrc}
          alt={product.product_name || "Product"}
          className="product-card__image"
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/400/300";
          }}
        />
      </div>

      <h3 className="product-card__title">
        {product.product_name || "Unnamed product"}
      </h3>

      <p className="text-muted product-card__price">${price}</p>

      {showCategory && product.category && (
        <small>{product.category.category_name}</small>
      )}

      <div className="product-card__actions">
        <button
          className="btn-ui btn-primary-ui"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View Product
        </button>

        {showQuickAdd && (
          <button
            className="btn-ui btn-secondary-ui"
            onClick={() => onQuickAdd && onQuickAdd(product.id)}
            disabled={busy}
            title="Add to cart"
          >
            {busy ? "..." : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}