import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Category = () => {
  const { id } = useParams(); // category id
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // Fetch category (includes owner)
        const categoryRes = await api.get(`/api/categories/${id}`);

        // Fetch products belonging to this category
        const productsRes = await api.get(`/api/products/by-category/${id}`);

        if (!mounted) return;

        setCategory(categoryRes.data);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        console.error("Failed to load category:", err);
        if (!mounted) return;
        setCategory(null);
        setProducts([]);
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

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const quickAdd = async (pid) => {
    if (!user?.id) return;

    try {
      setBusyPid(pid);

      await api.post("/api/cart/items", {
        product_id: pid,
        quantity: 1,
      });

      showToast();

      // Notify App.js to refresh cart count
      window.dispatchEvent(new CustomEvent("cart:changed"));

    } catch (err) {
      console.error("Quick add failed:", err);
    } finally {
      setBusyPid(null);
    }
  };

  return (
    <div className="container category-page">
      <div className="category-header">
        <div className="category-subheader">
          <h2 className="featured-items">
            {category?.category_name || "Category"}
          </h2>
          <div style={{ opacity: 0.8 }}>
            {products.length} item{products.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="product-wrapper">
        {products.map((p) => {
          // ✅ CORRECT: shop = category owner
          const shopId = category.user_id;

          const imgSrc =
            p.image_url || "https://picsum.photos/400/300";

          return (
            <div className="product" key={p.id}>
              <img
                className="product-img"
                src={imgSrc}
                alt={p.product_name || "Product"}
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/400/300";
                }}
              />

              <div className="product-description">
                <h6 className="product-name">{p.product_name}</h6>

                <p className="product-price">
                  Price: {currency.format(Number(p.price || 0))}
                </p>

                <div className="product-button">
                  <Link className="link isLink" to={`/profile/${shopId}`}>
                    <span className="welcome-link">Shop</span>
                  </Link>

                  <button
                    className="form-button product-button"
                    onClick={() => quickAdd(p.id)}
                    disabled={!user?.id || busyPid === p.id}
                    title={!user?.id ? "Login required" : "Quick Add"}
                    style={{ minWidth: 52, marginLeft: 10 }}
                  >
                    {busyPid === p.id ? "..." : "🛒"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center" style={{ marginTop: 18, opacity: 0.85 }}>
          No products found in this category.
        </div>
      )}

      {toast && (
        <div className="micro-toast">
          Added to cart
        </div>
      )}

    </div>
  );
};

export default Category;
