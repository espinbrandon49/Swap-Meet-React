import React from "react";

export default function CartItem({
  product,
  qty,
  disabled,
  onChangeQty,
  currency,
}) {
  const imgSrc = product.image_url || "https://picsum.photos/400/300";

  return (
    <div className="cart-product">
      <img
        className="cart-img"
        src={imgSrc}
        alt={product.product_name}
        onError={(e) => {
          e.currentTarget.src = "https://picsum.photos/400/300";
        }}
      />

      <h6 className="cart-product-name">{product.product_name}</h6>

      <p className="product-price">
        Price: {currency.format(Number(product.price || 0))}
      </p>

      <div className="cart-qty-row">
        <button
          type="button"
          className="btn-ui btn-secondary-ui"
          disabled={disabled}
          onClick={() => onChangeQty(product.id, qty - 1)}
        >
          -
        </button>

        <div className="cart-qty-label">
          Qty: <strong>{qty}</strong>
        </div>

        <button
          type="button"
          className="btn-ui btn-secondary-ui"
          disabled={disabled}
          onClick={() => onChangeQty(product.id, qty + 1)}
        >
          +
        </button>
      </div>

      <div className="cart-line-total">
        Line total: {currency.format(Number(product.price || 0) * qty)}
      </div>
    </div>
  );
}