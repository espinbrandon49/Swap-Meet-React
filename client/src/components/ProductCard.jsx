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
      {/* IMAGE */}
      <div style={{ marginBottom: "12px" }}>
        <img
          src={imgSrc}
          alt={product.product_name || "Product"}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/400/300";
          }}
        />
      </div>

      {/* NAME */}
      <h3>{product.product_name || "Unnamed product"}</h3>

      {/* PRICE */}
      <p className="text-muted">${price}</p>

      {/* CATEGORY */}
      {showCategory && product.category && (
        <small>{product.category.category_name}</small>
      )}

      {/* ACTIONS */}
      <div className="mt-2" style={{ display: "flex", gap: "8px" }}>
        <button
          className="btn-ui btn-primary-ui"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View
        </button>

        {showQuickAdd && (
          <button
            className="btn-ui btn-secondary-ui"
            onClick={() => onQuickAdd && onQuickAdd(product.id)}
            disabled={busy}
            title="Quick Add"
          >
            {busy ? "..." : "🛒"}
          </button>
        )}
      </div>
    </div>
  );
}