// src/pages/Profile.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Profile = () => {
  const { id } = useParams(); // profile user id (shop owner)
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [shopName, setShopName] = useState("");
  const [categories, setCategories] = useState([]);
  const [busyPid, setBusyPid] = useState(null);
  const [toast, setToast] = useState(false);

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === String(id);
  }, [user?.id, id]);

  useEffect(() => {
    let mounted = true;

    const loadShop = async () => {
      try {
        // Expected: categories include { user_id } and ideally { owner } and { products }
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

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const quickAdd = async (pid) => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      setBusyPid(pid);

      // ✅ Match Step 2 pattern (Category.js): cart items endpoint
      await api.post("/api/cart/items", {
        product_id: pid,
        quantity: 1,
      });

      showToast();

      // Notify App.js cart badge refresh
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
              className="form-button"
              style={{ marginTop: 10 }}
              onClick={() => navigate("/dashboard")}
            >
              Manage My Shop
            </button>
          )}
        </div>
      </div>

      {categories.length === 0 && (
        <div className="text-center" style={{ marginTop: 18, opacity: 0.85 }}>
          No categories found for this shop.
        </div>
      )}

      {categories.map((cat) => {
        const products = Array.isArray(cat.products) ? cat.products : [];

        return (
          <div className="category-list" key={cat.id}>
            {/* Category title (clickable) */}
            <ListGroup onClick={() => navigate(`/category/${cat.id}`)}>
              <ListGroup.Item className="border-0 p-0 link category-item category-name name-profile">
                {cat.category_name}
              </ListGroup.Item>
            </ListGroup>

            {/* Inline products */}
            <div className="product-wrapper">
              {products.map((p) => {
                const imgSrc = p.image_url || "https://picsum.photos/400/300";

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

                      {/* Footer actions */}
                      <div className="product-button" style={{ gap: 10 }}>
                        <button
                          className="form-button product-button"
                          onClick={() => navigate(`/product/${p.id}`)}
                          style={{ minWidth: 90 }}
                        >
                          View
                        </button>

                        <button
                          className="form-button product-button"
                          onClick={() => quickAdd(p.id)}
                          disabled={!user?.id || busyPid === p.id}
                          title={!user?.id ? "Login required" : "Quick Add"}
                          style={{ minWidth: 52 }}
                        >
                          {busyPid === p.id ? "..." : "🛒"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {products.length === 0 && (
                <div style={{ marginTop: 10, opacity: 0.8 }}>
                  No products in this category yet.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {toast && <div className="micro-toast">Added to cart</div>}
    </div>
  );
};

export default Profile;
