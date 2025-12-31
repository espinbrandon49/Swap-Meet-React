// src/pages/Cart.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [busyPid, setBusyPid] = useState(null);

  const [showCheckout, setShowCheckout] = useState(false);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const qtyOf = (p) => Number(p?.product_cart?.quantity ?? 1);

  // -------------------------
  // Load cart once
  // -------------------------
  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/cart/me");
      setCart(res.data || { products: [] });
    } catch (err) {
      if (err?.response?.status === 404) {
        setCart({ products: [] });
      } else {
        console.error("Failed to load cart:", err);
        setCart({ products: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // -------------------------
  // Optimistic quantity update
  // -------------------------
  const applyLocalQty = (product_id, quantity) => {
    setCart((prev) => {
      const products = Array.isArray(prev?.products) ? prev.products : [];

      const nextProducts = products
        .map((p) =>
          p.id === product_id
            ? {
              ...p,
              product_cart: {
                ...(p.product_cart || {}),
                quantity,
              },
            }
            : p
        )
        .filter((p) => Number(p?.product_cart?.quantity ?? 1) > 0);

      return { ...prev, products: nextProducts };
    });
  };

  const setQty = async (product_id, quantity) => {
    const scrollY = window.scrollY;

    const prevQty =
      qtyOf(cart?.products?.find((p) => p.id === product_id)) || 1;

    // clamp so UI never shows negative quantities
    const nextQty = Math.max(0, Number(quantity) || 0);

    // ✅ optimistic update
    applyLocalQty(product_id, nextQty);

    try {
      setBusyPid(product_id);
      await api.patch("/api/cart/items", { product_id, quantity: nextQty });
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
      // rollback on failure
      applyLocalQty(product_id, prevQty);
      await loadCart();
    } finally {
      setBusyPid(null);
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
    }
  };

  const total = useMemo(() => {
    const items = Array.isArray(cart?.products) ? cart.products : [];
    return items.reduce(
      (sum, p) => sum + Number(p.price || 0) * qtyOf(p),
      0
    );
  }, [cart]);

  // -------------------------
  // Guards
  // -------------------------
  if (!user?.id) {
    return (
      <div className="container" style={{ paddingTop: 18 }}>
        <h2>Shopping Cart</h2>
        <button className="form-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 18 }}>
        Loading cart...
      </div>
    );
  }

  const products = Array.isArray(cart?.products) ? cart.products : [];
  const isEmpty = products.length === 0;

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="container">
      <div className="cart-header">
        <h2 className="featured-items cart-subheader">Shopping Cart</h2>
      </div>

      {isEmpty ? (
        <div className="text-center">Shopping Cart Empty</div>
      ) : (
        <div className="product-wrapper product-wrapper-cart">
          {products.map((p) => {
            const qty = qtyOf(p);
            const disabled = busyPid === p.id;
            const imgSrc = p.image_url || "https://picsum.photos/400/300";

            return (
              <div className="cart-product" key={p.id}>
                <img className="cart-img" src={imgSrc} alt={p.product_name} />

                <h6 className="cart-product-name">{p.product_name}</h6>

                <p className="product-price">
                  Price: {currency.format(Number(p.price || 0))}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    className="form-button"
                    disabled={disabled}
                    onClick={() => setQty(p.id, qty - 1)}
                  >
                    -
                  </button>

                  <div style={{ minWidth: 90, textAlign: "center" }}>
                    Qty: <strong>{qty}</strong>
                  </div>

                  <button
                    type="button"
                    className="form-button"
                    disabled={disabled}
                    onClick={() => setQty(p.id, qty + 1)}
                  >
                    +
                  </button>
                </div>

                <div style={{ marginTop: 8, opacity: 0.85 }}>
                  Line total: {currency.format(Number(p.price || 0) * qty)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary + Checkout */}
      <div
        className="cart-summary"
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h3 className="cart-total" style={{ margin: 0 }}>
          Total: {currency.format(total)}
        </h3>

        <Button
          variant="primary"
          disabled={isEmpty}
          onClick={() => setShowCheckout(true)}
        >
          Checkout
        </Button>
      </div>

      {/* MVP Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p style={{ marginBottom: 0 }}>Thanks for testing checkout!</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cart;
