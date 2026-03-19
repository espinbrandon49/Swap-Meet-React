// src/pages/Cart.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import CartItem from "../components/CartItem";

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

  const qtyOf = (product) => Number(product?.product_cart?.quantity ?? 1);

  const products = useMemo(() => {
    return Array.isArray(cart?.products) ? cart.products : [];
  }, [cart]);

  const itemCount = useMemo(() => {
    return products.reduce((sum, product) => sum + qtyOf(product), 0);
  }, [products]);

  const subtotal = useMemo(() => {
    return products.reduce(
      (sum, product) => sum + Number(product.price || 0) * qtyOf(product),
      0
    );
  }, [products]);

  const distinctSellerCount = useMemo(() => {
    const sellerIds = new Set(
      products.map(
        (product) =>
          product?.owner?.id ??
          product?.user_id ??
          product?.owner_id ??
          product?.category?.owner?.id
      )
    );

    return Array.from(sellerIds).filter(Boolean).length;
  }, [products]);

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
  }, [user?.id]);

  const applyLocalQty = (productId, quantity) => {
    setCart((prev) => {
      const prevProducts = Array.isArray(prev?.products) ? prev.products : [];

      const nextProducts = prevProducts
        .map((product) =>
          product.id === productId
            ? {
                ...product,
                product_cart: {
                  ...(product.product_cart || {}),
                  quantity,
                },
              }
            : product
        )
        .filter((product) => Number(product?.product_cart?.quantity ?? 1) > 0);

      return {
        ...prev,
        products: nextProducts,
      };
    });
  };

  const setQty = async (productId, quantity) => {
    const scrollY = window.scrollY;

    const prevQty =
      qtyOf(products.find((product) => product.id === productId)) || 1;

    const nextQty = Math.max(0, Number(quantity) || 0);

    applyLocalQty(productId, nextQty);

    try {
      setBusyPid(productId);
      await api.patch("/api/cart/items", {
        product_id: productId,
        quantity: nextQty,
      });
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
      applyLocalQty(productId, prevQty);
      await loadCart();
    } finally {
      setBusyPid(null);
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
    }
  };

  if (!user?.id) {
    return (
      <div className="container" style={{ maxWidth: "920px" }}>
        <EmptyState
          title="Cart access requires login"
          message="Sign in to review saved items, adjust quantities, and continue through the buyer flow."
          action={
            <button
              type="button"
              className="btn-ui btn-primary-ui"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: "1200px" }}>
        <LoadingState
          title="Loading cart..."
          message="Pulling your selected items, quantities, and totals."
        />
      </div>
    );
  }

  const isEmpty = products.length === 0;

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "grid", gap: "24px" }}>
        <section className="card-ui" style={{ padding: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Buyer flow
                </small>
                <h1 style={{ margin: 0 }}>Shopping Cart</h1>
              </div>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  maxWidth: "760px",
                }}
              >
                Review your selected items, adjust quantities, and confirm the
                cart before checkout. This page is meant to make the purchase
                flow clearer and easier to scan.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Link to="/" className="btn-ui btn-secondary-ui">
                  Continue Shopping
                </Link>

                {!isEmpty ? (
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                ) : null}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(130px, 1fr))",
                gap: "12px",
                minWidth: "320px",
                flex: "1 1 320px",
              }}
            >
              <CartStatCard label="Items" value={itemCount} />
              <CartStatCard label="Sellers" value={distinctSellerCount} />
              <CartStatCard
                label="Subtotal"
                value={currency.format(subtotal)}
                compactText={true}
              />
            </div>
          </div>
        </section>

        {isEmpty ? (
          <EmptyState
            title="Your cart is empty"
            message="Add items from category or product pages to see them here."
            action={
              <Link to="/" className="btn-ui btn-primary-ui">
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 360px)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <section
              className="card-ui"
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <small style={{ display: "block", marginBottom: "4px" }}>
                    Cart items
                  </small>
                  <h2 style={{ margin: 0, fontSize: "26px" }}>
                    Selected products
                  </h2>
                </div>

                <div className="text-muted">
                  Adjust quantity directly from this page.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                {products.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    qty={qtyOf(product)}
                    disabled={busyPid === product.id}
                    onChangeQty={setQty}
                    currency={currency}
                  />
                ))}
              </div>
            </section>

            <aside
              className="card-ui"
              style={{
                display: "grid",
                gap: "18px",
                position: "sticky",
                top: "104px",
              }}
            >
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Order summary
                </small>
                <h2 style={{ margin: 0, fontSize: "24px" }}>Checkout panel</h2>
              </div>

              <div
                style={{
                  border: "1px solid #e4dccf",
                  borderRadius: "16px",
                  background: "#fcfaf6",
                  padding: "18px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <SummaryRow label="Items" value={itemCount} />
                <SummaryRow label="Distinct products" value={products.length} />
                <SummaryRow label="Subtotal" value={currency.format(subtotal)} />

                <div
                  style={{
                    height: "1px",
                    background: "#e4dccf",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b645b",
                    }}
                  >
                    Total
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#1f1f1f",
                      lineHeight: 1,
                    }}
                  >
                    {currency.format(subtotal)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-ui btn-primary-ui"
                onClick={() => setShowCheckout(true)}
                disabled={isEmpty}
              >
                Checkout
              </button>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                This portfolio build uses a mock checkout confirmation rather
                than a live payment flow.
              </p>
            </aside>
          </div>
        )}
      </div>

      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ margin: 0 }}>
              Thanks for testing the buyer flow.
            </p>
            <p className="text-muted" style={{ margin: 0 }}>
              This checkout step is intentionally mocked for portfolio demo
              purposes.
            </p>
            <div
              style={{
                border: "1px solid #e4dccf",
                borderRadius: "14px",
                padding: "14px",
                background: "#fcfaf6",
              }}
            >
              <strong>Total:</strong> {currency.format(subtotal)}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="btn-ui btn-secondary-ui"
            onClick={() => setShowCheckout(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

function CartStatCard({ label, value, compactText = false }) {
  return (
    <div className="card-ui" style={{ padding: "18px 20px" }}>
      <div
        style={{
          fontSize: "13px",
          color: "#6b645b",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: compactText ? "22px" : "30px",
          fontWeight: 700,
          color: "#1f1f1f",
          lineHeight: 1.1,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#6b645b",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f1f1f",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default Cart;