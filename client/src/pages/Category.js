// src/pages/Category.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import ProductCard from "../components/ProductCard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const owner = useMemo(() => {
    return (
      category?.owner || {
        id: category?.user_id,
        username: category?.username || category?.owner_username || "Shop",
      }
    );
  }, [category]);

  const isOwner = useMemo(() => {
    if (!user?.id || !owner?.id) return false;
    return String(user.id) === String(owner.id);
  }, [user?.id, owner?.id]);

  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + Number(product?.stock ?? 0), 0);
  }, [products]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const categoryRes = await api.get(`/api/categories/${id}`);
        const productsRes = await api.get(`/api/products/by-category/${id}`);

        if (!mounted) return;

        setCategory(categoryRes.data);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        console.error("Failed to load category:", err);
        if (!mounted) return;
        setCategory(null);
        setProducts([]);
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
              <PageHeader
                title={category?.category_name || "Category"}
                subtitle="Browse all products grouped under this seller-owned category."
                meta={
                  !loading
                    ? `${products.length} item${products.length === 1 ? "" : "s"}`
                    : ""
                }
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {owner?.id ? (
                  <Link
                    to={`/profile/${owner.id}`}
                    className="btn-ui btn-secondary-ui"
                  >
                    Visit Shop
                  </Link>
                ) : null}

                <Link to="/" className="btn-ui btn-secondary-ui">
                  Back to Home
                </Link>

                {isOwner ? (
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={() => navigate("/dashboard")}
                  >
                    Manage Category
                  </button>
                ) : null}
              </div>
            </div>

            {!loading && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(130px, 1fr))",
                  gap: "12px",
                  minWidth: "320px",
                  flex: "1 1 320px",
                }}
              >
                <CategoryStatCard label="Products" value={products.length} />
                <CategoryStatCard label="Units in Stock" value={totalStock} />
                <CategoryStatCard
                  label="Seller"
                  value={owner?.username || "Shop"}
                  compactText={true}
                />
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <LoadingState
            title="Loading category..."
            message="Fetching category details and products."
          />
        ) : !category ? (
          <EmptyState
            title="Category not found"
            message="This category may have been removed or the link may be invalid."
            action={
              <Link to="/" className="btn-ui btn-primary-ui">
                Back to Home
              </Link>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            message="This category does not have any products yet."
            action={
              owner?.id ? (
                <Link to={`/profile/${owner.id}`} className="btn-ui btn-secondary-ui">
                  Visit Shop
                </Link>
              ) : null
            }
          />
        ) : (
          <section style={{ display: "grid", gap: "20px" }}>
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
                  Product grid
                </small>
                <h2 style={{ margin: 0, fontSize: "26px" }}>
                  Items in {category.category_name}
                </h2>
              </div>

              <div className="text-muted">
                Quick add is available directly from this page.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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
          </section>
        )}

        {toast && <div className="micro-toast">Added to cart</div>}
      </div>
    </div>
  );
}

function CategoryStatCard({ label, value, compactText = false }) {
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