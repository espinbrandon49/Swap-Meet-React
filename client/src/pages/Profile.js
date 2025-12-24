import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Profile = () => {
  const { id } = useParams(); // profile user id
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [categories, setCategories] = useState([]);
  const [busyPid, setBusyPid] = useState(null);

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === String(id);
  }, [user?.id, id]);

  useEffect(() => {
    let mounted = true;

    const loadShop = async () => {
      try {
        // Your backend supports GET /api/categories (includes owner + products)
        const res = await api.get("/api/categories");
        const all = Array.isArray(res.data) ? res.data : [];

        // Filter categories owned by this profile user
        const mine = all.filter((c) => String(c?.owner?.id) === String(id));

        if (!mounted) return;

        setCategories(mine);
        setUsername(mine[0]?.owner?.username || "");
      } catch (err) {
        console.error("Failed to load shop:", err);
        if (!mounted) return;
        setCategories([]);
        setUsername("");
      }
    };

    loadShop();
    return () => {
      mounted = false;
    };
  }, [id]);

  const addToCart = async (pid) => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      setBusyPid(pid);
      await api.post("/api/products/addtocart", { pid });
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setBusyPid(null);
    }
  };

  return (
    <div className="container profile-items">
      <div className="profile-header">
        <div>
          {/* No user image endpoint in your current routes; keep a placeholder */}
          <img
            className="profile-img"
            src={"https://picsum.photos/200/200"}
            alt={username || "Shop"}
          />
        </div>

        <h2 className="featured-items">
          {isOwner ? "Your Shop" : username || "Shop"}
        </h2>
      </div>

      {categories.length === 0 && (
        <div className="text-center" style={{ marginTop: 18, opacity: 0.85 }}>
          No categories found for this shop.
        </div>
      )}

      {categories.map((cat) => (
        <div className="category-list" key={cat.id}>
          <ListGroup onClick={() => navigate(`/category/${cat.id}`)}>
            <ListGroup.Item className="border-0 p-0 link category-item category-name name-profile">
              {cat.category_name}
            </ListGroup.Item>
          </ListGroup>

          <div className="product-wrapper">
            {(Array.isArray(cat.products) ? cat.products : []).map((p) => (
              <div className="product" key={p.id}>
                <img
                  className="product-img"
                  src={p.image_url || "https://picsum.photos/400/300"}
                  alt={p.product_name || "Product"}
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/400/300";
                  }}
                />

                <div className="product-description">
                  <h6 className="product-name">{p.product_name}</h6>
                  <p className="product-price">Price: ${p.price}</p>

                  <div className="product-button">
                    {isOwner ? (
                      <button
                        className="form-button product-button"
                        onClick={() => navigate(`/category/${cat.id}`)}
                      >
                        Manage
                      </button>
                    ) : (
                      <button
                        className="form-button product-button"
                        onClick={() => addToCart(p.id)}
                        disabled={busyPid === p.id}
                        style={{ minWidth: 120 }}
                      >
                        {busyPid === p.id ? "Adding..." : "Add To Cart"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profile;
