// src/pages/Profile.js
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

  const displayName = shopName || (isOwner ? "Your Shop" : "Shop");
  const heroImage = "https://picsum.photos/320/320";

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "grid", gap: "24px" }}>
        <section className="card-ui" style={{ padding: "28px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px minmax(0, 1fr)",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src={heroImage}
                alt={displayName}
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "20px",
                  border: "1px solid #ddd4c7",
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/300/300";
                }}
              />
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Public shop page
                </small>
                <h1 style={{ margin: 0 }}>{displayName}</h1>
              </div>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  maxWidth: "760px",
                }}
              >
                Browse this seller’s categories and products in one place. This
                page acts as the public-facing storefront for the shop owner.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {isOwner ? (
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={() => navigate("/dashboard")}
                  >
                    Manage My Shop
                  </button>
                ) : null}

                <a href="#shop-categories" className="btn-ui btn-secondary-ui">
                  Browse Categories
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(140px, 1fr))",
            gap: "16px",
          }}
        >
          <ShopStatCard label="Categories" value={categories.length} />
          <ShopStatCard label="Products" value={totalProducts} />
          <ShopStatCard
            label="Owner View"
            value={isOwner ? "Yes" : "Public"}
            compactText={typeof (isOwner ? "Yes" : "Public") === "string"}
          />
        </section>

        <section id="shop-categories">
          <PageHeader
            title="Shop Categories"
            subtitle="Browse the storefront by seller-owned category."
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
            <div style={{ display: "grid", gap: "28px" }}>
              {categories.map((category) => {
                const products = Array.isArray(category.products)
                  ? category.products
                  : [];

                return (
                  <section key={category.id} className="card-ui">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                        flexWrap: "wrap",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <small style={{ display: "block", marginBottom: "4px" }}>
                          Category
                        </small>

                        <h2
                          style={{
                            margin: 0,
                            fontSize: "24px",
                            lineHeight: 1.2,
                          }}
                        >
                          {category.category_name || "Unnamed Category"}
                        </h2>

                        <p
                          className="text-muted"
                          style={{
                            margin: "8px 0 0",
                          }}
                        >
                          {products.length} product
                          {products.length === 1 ? "" : "s"} in this category
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
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                          gap: "20px",
                        }}
                      >
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            showCategory={false}
                            showQuickAdd={true}
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
        </section>

        {toast && <div className="micro-toast">Added to cart</div>}
      </div>
    </div>
  );
};

function ShopStatCard({ label, value, compactText = false }) {
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
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default Profile;