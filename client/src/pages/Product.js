// src/pages/Product.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Product = () => {
  const { id } = useParams(); // product id
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${id}`);

        // Accept either an object OR an array response
        const data = res.data;
        const p = Array.isArray(data) ? data[0] : data;

        if (!mounted) return;
        setProduct(p || null);
      } catch (err) {
        console.error("Failed to load product:", err);
        if (!mounted) return;
        setProduct(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1200);
  };

  const quickAdd = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    if (!product?.id) return;

    try {
      setBusy(true);
      await api.post("/api/cart/items", {
        product_id: product.id,
        quantity: 1,
      });

      window.dispatchEvent(new CustomEvent("cart:changed"));
      showToast();
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setBusy(false);
    }
  };

  // -------------------------
  // Guards
  // -------------------------
  if (loading) {
    return (
      <div className="container product-page">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-page">
        <h3 className="product-not-found">Product not found</h3>
        <button className="form-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  const imgSrc = product.image_url || "https://picsum.photos/800/600";
  const seller =
    product.owner?.username ||
    product.user?.username ||
    product.username ||
    product.owner_username ||
    "";

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="container product-page">
      <div className="product-layout">
        {/* Image */}
        <div className="product-image-wrap">
          <img
            className="product-image-lg"
            src={imgSrc}
            alt={product.product_name || "Product"}
            onError={(e) => {
              e.currentTarget.src = "https://picsum.photos/800/600";
            }}
          />
        </div>

        {/* Details */}
        <div className="product-details">
          <h2 className="product-title">
            {product.product_name || "Unnamed product"}
          </h2>

          <p className="product-price-lg">
            {currency.format(Number(product.price || 0))}
          </p>

          {seller && (
            <p className="product-seller">
              Sold by: <strong>{seller}</strong>
            </p>
          )}

          {product.description && (
            <p className="product-description-text">
              {product.description}
            </p>
          )}

          <div className="product-actions">
            <button className="form-button" onClick={() => navigate(-1)}>
              Back
            </button>

            <button
              className="form-button"
              onClick={quickAdd}
              disabled={!user?.id || busy}
              title={!user?.id ? "Login required" : "Add to cart"}
            >
              {busy ? "..." : "🛒 Quick Add"}
            </button>
          </div>

          {!user?.id && (
            <div className="product-auth-hint">
              Login to add this item to your cart.
            </div>
          )}
        </div>
      </div>

      {toast && <div className="micro-toast">Added to cart</div>}
    </div>
  );
};

export default Product;
