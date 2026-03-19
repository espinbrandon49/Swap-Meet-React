import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

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
                  username: data.username || data.owner_username || "Storefront",
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
    owner?.username ||
    category?.owner?.username ||
    product?.owner_username ||
    "Storefront";
  const categoryName =
    category?.category_name || product?.category_name || "Category";

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
      <div className="container">
        <LoadingState
          title="Loading product..."
          message="Pulling product details, seller info, and category context."
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page-shell-narrow">
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
    <div className="container">
      <div className="page-shell">
        <section className="card-ui product-layout">
          <div className="product-layout__grid">
            <div className="product-gallery">
              <div className="product-image-frame">
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.product_name}
                  className="product-image-frame__img"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="product-actions-row">
                <Link
                  to={category?.id ? `/category/${category.id}` : "/"}
                  className="btn-ui btn-secondary-ui"
                >
                  View Category
                </Link>

                {owner?.id ? (
                  <Link to={`/profile/${owner.id}`} className="btn-ui btn-secondary-ui">
                    View Storefront
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="product-details">
              <PageHeader
                title={product.product_name}
                subtitle="Product"
              />

              <div className="badge-row">
                <span className="soft-badge">{categoryName}</span>
                <span className="soft-badge">Storefront: {ownerName}</span>
                <span className="soft-badge">
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="product-price-lg">
                {currency.format(Number(product.price || 0))}
              </div>

              <div className="purchase-panel">
                <div>
                  <h2 className="purchase-panel__title">Add to Cart</h2>
                  <p className="text-muted purchase-panel__subtitle">
                    Choose a quantity and add this item to your cart.
                  </p>
                </div>

                <div className="purchase-panel__grid">
                  <div>
                    <label htmlFor="product-quantity" className="form-label-ui">
                      Quantity
                    </label>
                    <input
                      id="product-quantity"
                      type="number"
                      min="1"
                      max={stock > 0 ? stock : undefined}
                      className="input-ui"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      disabled={stock <= 0}
                    />
                  </div>

                  <div className="button-row">
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
                        View More Products
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div className="product-owner-box">
                  <small>Owner</small>
                  <strong>You own this listing.</strong>
                  <div className="text-muted">
                    Manage this product from your dashboard.
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

        <section className="stats-grid-3">
          <ProductStatCard
            label="Price"
            value={currency.format(Number(product.price || 0))}
          />
          <ProductStatCard label="Stock" value={stock} />
          <ProductStatCard label="Category" value={categoryName} compactText />
        </section>

        <section className="card-ui">
          <div className="context-grid">
            <div>
              <small className="mb-1">Listing details</small>
              <h2 className="mb-0">Storefront and category</h2>
            </div>

            <div className="context-card-grid">
              <div className="context-card">
                <small>Storefront</small>
                <div className="context-card__value">{ownerName}</div>
                <p className="text-muted mb-0">
                  Browse more listings from this storefront.
                </p>
                {owner?.id ? (
                  <div>
                    <Link to={`/profile/${owner.id}`} className="btn-ui btn-secondary-ui">
                      View Storefront
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="context-card">
                <small>Category</small>
                <div className="context-card__value">{categoryName}</div>
                <p className="text-muted mb-0">
                  Open the category page to compare related items.
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