import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import CartItem from "../components/CartItem";
import PageHeader from "../components/PageHeader";

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
      <div className="container page-shell-narrow">
        <EmptyState
          title="Cart access requires login"
          message="Sign in to review your items and continue to checkout."
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
      <div className="container">
        <LoadingState
          title="Loading cart..."
          message="Pulling your items and totals."
        />
      </div>
    );
  }

  const isEmpty = products.length === 0;

  return (
    <div className="container">
      <div className="page-shell">
        <section className="card-ui cart-hero">
          <div className="cart-hero__top">
            <div className="cart-hero__copy">
              <PageHeader
                title="Cart"
                subtitle="Review your items and continue to checkout."
                right={
                  <div className="cart-hero__actions">
                    <Link to="/" className="btn-ui btn-secondary-ui">
                      Browse Categories
                    </Link>

                    {!isEmpty ? (
                      <button
                        type="button"
                        className="btn-ui btn-primary-ui"
                        onClick={() => setShowCheckout(true)}
                      >
                        Checkout
                      </button>
                    ) : null}
                  </div>
                }
              />
            </div>

            <div className="cart-stat-grid">
              <CartStatCard label="Items" value={itemCount} />
              <CartStatCard label="Shops" value={distinctSellerCount} />
              <CartStatCard
                label="Subtotal"
                value={currency.format(subtotal)}
                compactText
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
                Browse Categories
              </Link>
            }
          />
        ) : (
          <div className="cart-layout">
            <section className="card-ui cart-section">
              <div className="cart-section__head">
                <PageHeader
                  title="Products in Cart"
                  subtitle="Update quantities and review your selections."
                />
              </div>

              <div className="cart-items-grid">
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

            <aside className="card-ui cart-summary">
              <PageHeader title="Checkout" subtitle="Order summary" />

              <div className="cart-summary__box">
                <SummaryRow label="Items" value={itemCount} />
                <SummaryRow label="Distinct products" value={products.length} />
                <SummaryRow label="Subtotal" value={currency.format(subtotal)} />

                <div className="summary-divider" />

                <div className="summary-total">
                  <div className="summary-total__label">Total</div>
                  <div className="summary-total__value">
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
            </aside>
          </div>
        )}
      </div>

      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="checkout-modal-stack">
            <p className="mb-0">Thanks for reviewing the cart flow.</p>
            <div className="checkout-total-box">
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
    <div className="card-ui">
      <div className="stat-card__label">{label}</div>
      <div
        className={`stat-card__value${
          compactText ? " stat-card__value--compact" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <div className="summary-row__label">{label}</div>
      <div className="summary-row__value">{value}</div>
    </div>
  );
}

export default Cart;