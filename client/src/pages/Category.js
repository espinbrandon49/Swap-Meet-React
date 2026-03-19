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
        username: category?.username || category?.owner_username || "Storefront",
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
    <div className="container">
      <div className="page-shell">
        <section className="card-ui category-hero">
          <div className="category-hero__top">
            <div>
              <PageHeader
                title={category?.category_name || "Category"}
                subtitle="Products in this category."
                meta={
                  !loading
                    ? `${products.length} item${products.length === 1 ? "" : "s"}`
                    : ""
                }
              />

              <div className="category-hero__actions">
                {owner?.id ? (
                  <Link to={`/profile/${owner.id}`} className="btn-ui btn-secondary-ui">
                    View Storefront
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
                    Manage Inventory
                  </button>
                ) : null}
              </div>
            </div>

            {!loading && (
              <div className="category-stat-grid">
                <CategoryStatCard label="Products" value={products.length} />
                <CategoryStatCard label="Units in Stock" value={totalStock} />
                <CategoryStatCard
                  label="Storefront"
                  value={owner?.username || "Storefront"}
                  compactText
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
                  View Storefront
                </Link>
              ) : null
            }
          />
        ) : (
          <section className="category-content">
            <div className="category-content__head">
              <div>
                <small className="category-content__eyebrow">Products</small>
                <h2 className="category-content__title">
                  Products in {category.category_name}
                </h2>
              </div>
            </div>

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
          </section>
        )}

        {toast && <div className="micro-toast">Added to cart</div>}
      </div>
    </div>
  );
}

function CategoryStatCard({ label, value, compactText = false }) {
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