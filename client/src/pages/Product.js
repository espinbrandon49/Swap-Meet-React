// src/pages/Product.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

const FALLBACK_IMAGE = "https://picsum.photos/900/700";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [owner, setOwner] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const isOwner = useMemo(() => {
    if (!user?.id || !owner?.id) return false;
    return String(user.id) === String(owner.id);
  }, [user?.id, owner?.id]);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/products/${id}`);
        const data = res.data;

        if (!mounted) return;

        setProduct(data || null);
        setCategory(data?.category || null);
        setOwner(
          data?.owner ||
            data?.category?.owner ||
            (data?.user_id
              ? {
                  id: data.user_id,
                  username: data.username || data.owner_username || "Seller",
                }
              : null)
        );
      } catch (err) {
        console.error("Failed to load product:", err);
        if (!mounted) return;
        setProduct(null);
        setCategory(null);
        setOwner(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const stock = Number(product?.stock ?? 0);
  const safeQuantity = Math.max(1, Math.min(quantity, stock || 1));
  const ownerName =
    owner?.username || category?.owner?.username || product?.owner_username || "Seller";
  const categoryName = category?.category_name || product?.category_name || "Category";

  const handleQuantityChange = (nextValue) => {
    const numeric = Number(nextValue);

    if (!Number.isFinite(numeric) || numeric < 1) {
      setQuantity(1);
      return;
    }

    if (stock > 0) {
      setQuantity(Math.min(numeric, stock));
      return;
    }

    setQuantity(numeric);
  };

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1200);
  };

  const addToCart = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (!product?.id || stock <= 0) return;

    try {
      setSubmitting(true);

      await api.post("/api/cart/items", {
        product_id: product.id,
        quantity: safeQuantity,
      });

      showToast();
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: "1200px" }}>
        <LoadingState
          title="Loading product..."
          message="Pulling product details, seller info, and category context."
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ maxWidth: "900px" }}>
        <EmptyState
          title="Product not found"
          message="This listing may have been removed or the link may be invalid."
          action={
            <Link to="/" className="btn-ui btn-primary-ui">
              Back to Home
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "grid", gap: "24px" }}>
        <section className="card-ui" style={{ padding: "28px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
              gap: "28px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              <div
                style={{
                  borderRadius: "22px",
                  overflow: "hidden",
                  border: "1px solid #ddd4c7",
                  background: "#f4efe7",
                }}
              >
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.product_name}
                  style={{
                    width: "100%",
                    height: "520px",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to={category?.id ? `/category/${category.id}` : "/"}
                  className="btn-ui btn-secondary-ui"
                >
                  Back to Category
                </Link>

                {owner?.id ? (
                  <Link
                    to={`/profile/${owner.id}`}
                    className="btn-ui btn-secondary-ui"
                  >
                    Visit Shop
                  </Link>
                ) : null}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Marketplace listing
                </small>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "40px",
                    lineHeight: 1.1,
                  }}
                >
                  {product.product_name}
                </h1>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span className="soft-badge">{categoryName}</span>
                <span className="soft-badge">
                  Seller: {ownerName}
                </span>
                <span className="soft-badge">
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 700,
                  color: "#1f1f1f",
                  lineHeight: 1,
                }}
              >
                {currency.format(Number(product.price || 0))}
              </div>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                This product page is designed to make the buyer flow clearer:
                the item, its category, its seller, and the next action all live
                in one place instead of being scattered across the app.
              </p>

              <div
                style={{
                  border: "1px solid #e4dccf",
                  borderRadius: "18px",
                  padding: "18px",
                  background: "#fcfaf6",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px",
                    }}
                  >
                    Purchase panel
                  </h2>
                  <p
                    className="text-muted"
                    style={{
                      marginTop: "6px",
                      marginBottom: 0,
                    }}
                  >
                    Choose quantity and add this item to your cart.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px minmax(0, 1fr)",
                    gap: "14px",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label
                      htmlFor="product-quantity"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Quantity
                    </label>
                    <input
                      id="product-quantity"
                      type="number"
                      min="1"
                      max={stock > 0 ? stock : undefined}
                      className="form-input"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      disabled={stock <= 0}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-ui btn-primary-ui"
                      onClick={addToCart}
                      disabled={submitting || stock <= 0}
                    >
                      {stock <= 0
                        ? "Out of Stock"
                        : submitting
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>

                    {owner?.id ? (
                      <Link
                        to={`/profile/${owner.id}`}
                        className="btn-ui btn-secondary-ui"
                      >
                        More from Seller
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div
                  style={{
                    border: "1px solid #e4dccf",
                    borderRadius: "16px",
                    padding: "16px",
                    background: "#f7f1e7",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <small>Owner visibility</small>
                  <strong>You own this listing.</strong>
                  <div className="text-muted">
                    Manage this product through your dashboard and shop pages.
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn-ui btn-secondary-ui"
                      onClick={() => navigate("/dashboard")}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
            gap: "16px",
          }}
        >
          <ProductStatCard label="Price" value={currency.format(Number(product.price || 0))} />
          <ProductStatCard label="Stock" value={stock} compactText={typeof stock === "string"} />
          <ProductStatCard label="Category" value={categoryName} compactText={true} />
        </section>

        <section className="card-ui">
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <div>
              <small style={{ display: "block", marginBottom: "6px" }}>
                Listing context
              </small>
              <h2 style={{ margin: 0, fontSize: "26px" }}>
                Seller and category
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  border: "1px solid #e4dccf",
                  borderRadius: "16px",
                  padding: "18px",
                  background: "#fcfaf6",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <small>Seller</small>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1f1f1f",
                  }}
                >
                  {ownerName}
                </div>
                <p className="text-muted" style={{ margin: 0 }}>
                  View the seller storefront to browse more products from the
                  same shop owner.
                </p>
                {owner?.id ? (
                  <div>
                    <Link
                      to={`/profile/${owner.id}`}
                      className="btn-ui btn-secondary-ui"
                    >
                      Visit Shop
                    </Link>
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  border: "1px solid #e4dccf",
                  borderRadius: "16px",
                  padding: "18px",
                  background: "#fcfaf6",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <small>Category</small>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1f1f1f",
                  }}
                >
                  {categoryName}
                </div>
                <p className="text-muted" style={{ margin: 0 }}>
                  Browse the full category page to compare this listing with
                  related items.
                </p>
                {category?.id ? (
                  <div>
                    <Link
                      to={`/category/${category.id}`}
                      className="btn-ui btn-secondary-ui"
                    >
                      View Category
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {toast && <div className="micro-toast">Added to cart</div>}
      </div>
    </div>
  );
}

function ProductStatCard({ label, value, compactText = false }) {
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