import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import PageHeader from "../components/PageHeader";
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

  const qtyOf = (p) => Number(p?.product_cart?.quantity ?? 1);

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

    const nextQty = Math.max(0, Number(quantity) || 0);

    applyLocalQty(product_id, nextQty);

    try {
      setBusyPid(product_id);
      await api.patch("/api/cart/items", { product_id, quantity: nextQty });
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
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

  if (!user?.id) {
    return (
      <div className="container cart-page">
        <EmptyState
          title="Shopping Cart"
          message="Login required to view your cart."
          action={
            <button
              className="btn-ui btn-primary-ui"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container cart-page">
        <LoadingState
          title="Loading cart..."
          message="Pulling your selected items and totals."
        />
      </div>
    );
  }

  const products = Array.isArray(cart?.products) ? cart.products : [];
  const isEmpty = products.length === 0;
  const itemCount = products.reduce((sum, p) => sum + qtyOf(p), 0);

  return (
    <div className="container cart-page">
      <PageHeader
        title="Shopping Cart"
        subtitle="Review your selected items before checkout."
        meta={`${itemCount} item${itemCount === 1 ? "" : "s"}`}
      />

      {isEmpty ? (
        <EmptyState
          title="Shopping Cart Empty"
          message="Add items from category or product pages to see them here."
        />
      ) : (
        <div className="product-wrapper product-wrapper-cart">
          {products.map((p) => (
            <CartItem
              key={p.id}
              product={p}
              qty={qtyOf(p)}
              disabled={busyPid === p.id}
              onChangeQty={setQty}
              currency={currency}
            />
          ))}
        </div>
      )}

      <div className="cart-summary">
        <h3 className="cart-total cart-total-heading">
          Total: {currency.format(total)}
        </h3>

        <Button
          className="btn-ui btn-primary-ui"
          disabled={isEmpty}
          onClick={() => setShowCheckout(true)}
        >
          Checkout
        </Button>
      </div>

      <Modal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="cart-checkout-msg">
            Thanks for testing checkout!
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            className="btn-ui btn-secondary-ui"
            onClick={() => setShowCheckout(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cart;