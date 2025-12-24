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

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 18 }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: 18 }}>
        <h3 style={{ marginBottom: 10 }}>Product not found</h3>
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

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", maxWidth: 520 }}>
          <img
            src={imgSrc}
            alt={product.product_name || "Product"}
            style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = "https://picsum.photos/800/600";
            }}
          />
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <h2 style={{ marginTop: 0 }}>
            {product.product_name || "Unnamed product"}
          </h2>

          <p style={{ fontSize: 18, marginTop: 8 }}>
            {currency.format(Number(product.price || 0))}
          </p>

          {seller && (
            <p style={{ opacity: 0.85, marginTop: 6 }}>
              Sold by: <strong>{seller}</strong>
            </p>
          )}

          {product.description && (
            <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
              {product.description}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
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
            <div style={{ marginTop: 10, opacity: 0.8 }}>
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
