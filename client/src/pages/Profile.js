import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [shopName, setShopName] = useState("");
  const [categories, setCategories] = useState([]);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === String(id);
  }, [user?.id, id]);

  useEffect(() => {
    let mounted = true;

    const loadShop = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/categories");
        const all = Array.isArray(res.data) ? res.data : [];

        const mine = all.filter((c) => {
          const ownerId = c.user_id ?? c.owner?.id ?? c.owner_id;
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

  return (
    <div className="container profile-items">
      <div className="profile-header">
        <div>
          <img
            className="profile-img"
            src={"https://picsum.photos/200/200"}
            alt={shopName || "Shop"}
          />
        </div>

        <div>
          <h2 className="featured-items m-0">
            {shopName || (isOwner ? "Your Shop" : "Shop")}
          </h2>

          {isOwner && (
            <button
              className="form-button profile-manage-btn"
              onClick={() => navigate("/dashboard")}
            >
              Manage My Shop
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState
          title="Loading shop..."
          message="Gathering categories and products for this shop."
        />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          message="This shop has not created any categories yet."
          className="profile-empty"
        />
      ) : (
        categories.map((cat) => {
          const products = Array.isArray(cat.products) ? cat.products : [];

          return (
            <div className="category-list" key={cat.id}>
              <ListGroup onClick={() => navigate(`/category/${cat.id}`)}>
                <ListGroup.Item className="border-0 p-0 link category-item category-name name-profile">
                  {cat.category_name}
                </ListGroup.Item>
              </ListGroup>

              {products.length === 0 ? (
                <div style={{ marginTop: "12px" }}>
                  <EmptyState
                    title="No products in this category"
                    message="This category is live, but no items have been added yet."
                    className="profile-empty-sub"
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px",
                    marginTop: "12px",
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
            </div>
          );
        })
      )}

      {toast && <div className="micro-toast">Added to cart</div>}
    </div>
  );
};

export default Profile;