import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [shopName, setShopName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === String(id);
  }, [user?.id, id]);

  const totalProducts = useMemo(() => {
    return categories.reduce((sum, category) => {
      const products = Array.isArray(category.products) ? category.products : [];
      return sum + products.length;
    }, 0);
  }, [categories]);

  useEffect(() => {
    let mounted = true;

    const loadShop = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/categories");
        const all = Array.isArray(res.data) ? res.data : [];

        const mine = all.filter((category) => {
          const ownerId =
            category.user_id ?? category.owner?.id ?? category.owner_id;
          return String(ownerId) === String(id);
        });

        if (!mounted) return;

        setCategories(mine);

        const name =
          mine[0]?.owner?.username ??
          mine[0]?.username ??
          mine[0]?.owner_username ??
          "";

        setShopName(name);
      } catch (err) {
        console.error("Failed to load shop:", err);
        if (!mounted) return;
        setCategories([]);
        setShopName("");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadShop();

    return () => {
      mounted = false;
    };
  }, [id]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1200);
  };

  const quickAdd = async (pid) => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      setBusyPid(pid);

      await api.post("/api/cart/items", {
        product_id: pid,
        quantity: 1,
      });

      showToast();
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
      console.error("Quick add failed:", err);
    } finally {
      setBusyPid(null);
    }
  };

  const displayName = shopName || (isOwner ? "Your Storefront" : "Storefront");
  const heroImage = "https://picsum.photos/320/320";

  return (
    <div className="container">
      <div className="page-shell">
        <section className="card-ui shop-hero">
          <div className="shop-hero__grid">
            <div>
              <img
                src={heroImage}
                alt={displayName}
                className="shop-hero__image"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/300/300";
                }}
              />
            </div>

            <div className="shop-hero__content">
              <PageHeader
                title={displayName}
                subtitle="Storefront"
                meta={
                  !loading
                    ? `${categories.length} categor${
                        categories.length === 1 ? "y" : "ies"
                      } · ${totalProducts} product${totalProducts === 1 ? "" : "s"}`
                    : ""
                }
                right={
                  <div className="button-row">
                    {isOwner ? (
                      <button
                        type="button"
                        className="btn-ui btn-primary-ui"
                        onClick={() => navigate("/dashboard")}
                      >
                        Manage Your Storefront
                      </button>
                    ) : null}

                    <a href="#shop-categories" className="btn-ui btn-secondary-ui">
                      View Categories
                    </a>
                  </div>
                }
              />

              <p className="text-muted shop-hero__copy">
                Browse categories and products from this storefront.
              </p>
            </div>
          </div>
        </section>

        <section className="stats-grid-3">
          <ShopStatCard label="Categories" value={categories.length} />
          <ShopStatCard label="Products" value={totalProducts} />
          <ShopStatCard
            label="View"
            value={isOwner ? "Owner" : "Public"}
            compactText
          />
        </section>

        <section id="shop-categories">
          <PageHeader
            title="Shop Categories"
            subtitle="Browse this storefront by category."
          />

          {loading ? (
            <LoadingState
              title="Loading shop..."
              message="Gathering categories and products for this shop."
            />
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              message="This shop has not created any categories yet."
              action={
                isOwner ? (
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="category-section-list">
              {categories.map((category) => {
                const products = Array.isArray(category.products)
                  ? category.products
                  : [];

                return (
                  <section key={category.id} className="card-ui">
                    <div className="category-section-card__head">
                      <div>
                        <small className="category-section-card__eyebrow">
                          Category
                        </small>

                        <h2 className="category-section-card__title">
                          {category.category_name || "Unnamed Category"}
                        </h2>

                        <p className="text-muted category-section-card__meta">
                          {products.length} product{products.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div>
                        <Link
                          to={`/category/${category.id}`}
                          className="btn-ui btn-secondary-ui"
                        >
                          View Category
                        </Link>
                      </div>
                    </div>

                    {products.length === 0 ? (
                      <EmptyState
                        title="No products in this category"
                        message="This category is live, but no items have been added yet."
                      />
                    ) : (
                      <div className="grid-products">
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            showCategory={false}
                            showQuickAdd
                            busy={busyPid === product.id}
                            onQuickAdd={quickAdd}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {toast && <div className="micro-toast">Added to cart</div>}
        </section>
      </div>
    </div>
  );
};

function ShopStatCard({ label, value, compactText = false }) {
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

export default Profile;