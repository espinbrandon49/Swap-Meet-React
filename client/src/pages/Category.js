import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import ProductCard from "../components/ProductCard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

const Category = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!user?.id) return;

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
    <div className="container category-page">
      <PageHeader
        title={category?.category_name || "Category"}
        subtitle="Products in this category"
        meta={
          !loading
            ? `${products.length} item${products.length === 1 ? "" : "s"}`
            : ""
        }
      />

      {loading ? (
        <LoadingState
          title="Loading category..."
          message="Fetching category details and products."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          message="This category does not have any products yet."
          className="category-empty"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              showCategory={false}
              showQuickAdd={true}
              busy={busyPid === p.id}
              onQuickAdd={quickAdd}
            />
          ))}
        </div>
      )}

      {toast && <div className="micro-toast">Added to cart</div>}
    </div>
  );
};

export default Category;