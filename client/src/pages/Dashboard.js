// src/pages/Dashboard.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const THUMBS = useMemo(
    () => [
      "https://picsum.photos/id/1011/600/400",
      "https://picsum.photos/id/1025/600/400",
      "https://picsum.photos/id/1035/600/400",
      "https://picsum.photos/id/1047/600/400",
      "https://picsum.photos/id/1062/600/400",
      "https://picsum.photos/id/1074/600/400",
      "https://picsum.photos/id/1084/600/400",
      "https://picsum.photos/id/1080/600/400",
    ],
    []
  );

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [newCatName, setNewCatName] = useState("");

  const [showEditCat, setShowEditCat] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  const [newProd, setNewProd] = useState({
    product_name: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: THUMBS[0],
  });

  const [showEditProd, setShowEditProd] = useState(false);
  const [editProd, setEditProd] = useState(null);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const reload = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const res = await api.get("/api/categories");
      const all = Array.isArray(res.data) ? res.data : [];

      const mine = all.filter((c) => {
        const ownerId = c.user_id ?? c.owner?.id ?? c.owner_id;
        return String(ownerId) === String(user.id);
      });

      setCategories(mine);

      const flat = [];
      for (const c of mine) {
        const ps = Array.isArray(c.products) ? c.products : [];
        for (const p of ps) {
          flat.push({ ...p, _category: c });
        }
      }

      setProducts(flat);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openEditCategory = (cat) => {
    setEditCatId(cat.id);
    setEditCatName(cat.category_name || "");
    setShowEditCat(true);
  };

  const addCategory = async () => {
    const name = (newCatName || "").trim();
    if (!name) return alert("Category name is required");

    try {
      await api.post("/api/categories", { category_name: name });
      setNewCatName("");
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add category");
    }
  };

  const saveCategory = async () => {
    const name = (editCatName || "").trim();
    if (!editCatId || !name) return alert("Category name is required");

    try {
      await api.patch(`/api/categories/${editCatId}`, { category_name: name });
      setShowEditCat(false);
      setEditCatId(null);
      setEditCatName("");
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update category");
    }
  };

  const deleteCategory = async (catId) => {
    if (!catId) return;

    const ok = window.confirm(
      "Delete this category? Products inside it may also be removed depending on your database cascade."
    );
    if (!ok) return;

    try {
      await api.delete(`/api/categories/${catId}`);
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete category");
    }
  };

  const openEditProduct = (p) => {
    setEditProd({
      id: p.id,
      product_name: p.product_name || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? ""),
      category_id: String(p.category_id ?? p.categoryId ?? p._category?.id ?? ""),
      image_url: p.image_url || THUMBS[0],
    });
    setShowEditProd(true);
  };

  const addProduct = async () => {
    const payload = {
      product_name: (newProd.product_name || "").trim(),
      price: Number(newProd.price),
      stock: Number(newProd.stock),
      category_id: Number(newProd.category_id),
      image_url: newProd.image_url || THUMBS[0],
    };

    if (!payload.product_name) return alert("Product name is required");
    if (!Number.isFinite(payload.price)) return alert("Price must be a number");
    if (!Number.isFinite(payload.stock)) return alert("Stock must be a number");
    if (!Number.isInteger(payload.category_id)) return alert("Category is required");

    try {
      await api.post("/api/products", payload);
      setNewProd({
        product_name: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: THUMBS[0],
      });
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add product");
    }
  };

  const saveProduct = async () => {
    if (!editProd?.id) return;

    const payload = {
      product_name: (editProd.product_name || "").trim(),
      price: Number(editProd.price),
      stock: Number(editProd.stock),
      category_id: Number(editProd.category_id),
      image_url: editProd.image_url || THUMBS[0],
    };

    if (!payload.product_name) return alert("Product name is required");
    if (!Number.isFinite(payload.price)) return alert("Price must be a number");
    if (!Number.isFinite(payload.stock)) return alert("Stock must be a number");
    if (!Number.isInteger(payload.category_id)) return alert("Category is required");

    try {
      await api.patch(`/api/products/${editProd.id}`, payload);
      setShowEditProd(false);
      setEditProd(null);
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update product");
    }
  };

  const deleteProduct = async (pid) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/api/products/${pid}`);
      await reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete product");
    }
  };

  if (!user?.id) {
    return (
      <div className="container" style={{ maxWidth: "900px" }}>
        <div
          className="card-ui"
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          <small>Seller access</small>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            You need to be signed in to manage categories and products.
          </p>
          <div>
            <button
              type="button"
              className="btn-ui btn-primary-ui"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalStock = products.reduce((sum, p) => sum + Number(p?.stock ?? 0), 0);

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div
        style={{
          display: "grid",
          gap: "24px",
        }}
      >
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
              <Link
                to={`/profile/${user.id}`}
                style={{
                  textDecoration: "none",
                  fontWeight: 600,
                  color: "#7c5c3b",
                }}
              >
                ← Back to My Shop
              </Link>

              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Owner workspace
                </small>
                <h1 style={{ margin: 0 }}>Dashboard</h1>
              </div>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  maxWidth: "760px",
                }}
              >
                Manage your storefront structure from one place. Create categories,
                add products, and keep your shop organized without bouncing between screens.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
                gap: "12px",
                minWidth: "320px",
                flex: "1 1 320px",
              }}
            >
              <StatCard label="Categories" value={categories.length} />
              <StatCard label="Products" value={products.length} />
              <StatCard label="Units in Stock" value={totalStock} />
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingState
            title="Loading dashboard..."
            message="Pulling your categories, products, and shop data."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <section
              className="card-ui"
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Structure
                </small>
                <h2 style={{ margin: 0, fontSize: "24px" }}>Categories</h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                <label
                  htmlFor="new-category-name"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Add a category
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "10px",
                  }}
                >
                  <input
                    id="new-category-name"
                    type="text"
                    className="form-input"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Example: Vintage Jackets"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCategory();
                    }}
                  />
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={addCategory}
                  >
                    Add
                  </button>
                </div>
              </div>

              {categories.length === 0 ? (
                <EmptyState
                  title="No categories yet"
                  message="Create your first category to start structuring your shop."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {categories.map((c) => {
                    const categoryProducts = Array.isArray(c.products) ? c.products : [];

                    return (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid #e4dccf",
                          borderRadius: "14px",
                          padding: "16px",
                          background: "#fcfaf6",
                          display: "grid",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "16px",
                                color: "#1f1f1f",
                              }}
                            >
                              {c.category_name}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#6b645b",
                                marginTop: "4px",
                              }}
                            >
                              {categoryProducts.length} product
                              {categoryProducts.length === 1 ? "" : "s"}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="btn-ui btn-secondary-ui"
                              onClick={() => openEditCategory(c)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-ui btn-secondary-ui"
                              onClick={() => deleteCategory(c.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section
              className="card-ui"
              style={{
                display: "grid",
                gap: "22px",
              }}
            >
              <div>
                <small style={{ display: "block", marginBottom: "6px" }}>
                  Inventory
                </small>
                <h2 style={{ margin: 0, fontSize: "24px" }}>Products</h2>
              </div>

              <div
                style={{
                  border: "1px solid #e4dccf",
                  borderRadius: "16px",
                  padding: "18px",
                  background: "#fcfaf6",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Add a product</h3>
                  <p
                    className="text-muted"
                    style={{ marginTop: "6px", marginBottom: 0 }}
                  >
                    MVP note: product images are selected from a static thumbnail list.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div style={{ gridColumn: "span 6" }}>
                    <label
                      htmlFor="new-product-name"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                    >
                      Product name
                    </label>
                    <input
                      id="new-product-name"
                      type="text"
                      className="form-input"
                      value={newProd.product_name}
                      onChange={(e) =>
                        setNewProd((prev) => ({
                          ...prev,
                          product_name: e.target.value,
                        }))
                      }
                      placeholder="Example: Denim Jacket"
                    />
                  </div>

                  <div style={{ gridColumn: "span 3" }}>
                    <label
                      htmlFor="new-product-price"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                    >
                      Price
                    </label>
                    <input
                      id="new-product-price"
                      type="text"
                      className="form-input"
                      value={newProd.price}
                      onChange={(e) =>
                        setNewProd((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="24.99"
                    />
                  </div>

                  <div style={{ gridColumn: "span 3" }}>
                    <label
                      htmlFor="new-product-stock"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                    >
                      Stock
                    </label>
                    <input
                      id="new-product-stock"
                      type="text"
                      className="form-input"
                      value={newProd.stock}
                      onChange={(e) =>
                        setNewProd((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      placeholder="10"
                    />
                  </div>

                  <div style={{ gridColumn: "span 6" }}>
                    <label
                      htmlFor="new-product-category"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                    >
                      Category
                    </label>
                    <select
                      id="new-product-category"
                      className="form-input"
                      value={newProd.category_id}
                      onChange={(e) =>
                        setNewProd((prev) => ({
                          ...prev,
                          category_id: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "span 6" }}>
                    <label
                      htmlFor="new-product-thumb"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                    >
                      Thumbnail
                    </label>
                    <select
                      id="new-product-thumb"
                      className="form-input"
                      value={newProd.image_url}
                      onChange={(e) =>
                        setNewProd((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }))
                      }
                    >
                      {THUMBS.map((thumb) => (
                        <option key={thumb} value={thumb}>
                          {thumb}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={newProd.image_url || THUMBS[0]}
                      alt="Preview"
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid #ddd4c7",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = THUMBS[0];
                      }}
                    />
                    <div style={{ fontSize: "14px", color: "#6b645b" }}>
                      Preview image for the new product.
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={addProduct}
                  >
                    Add Product
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  title="No products yet"
                  message="Once you add products, they will appear here with category, price, and stock details."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  {products.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        border: "1px solid #e4dccf",
                        borderRadius: "16px",
                        padding: "16px",
                        background: "#ffffff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          minWidth: 0,
                          flex: "1 1 420px",
                        }}
                      >
                        <img
                          src={p.image_url || THUMBS[0]}
                          alt={p.product_name}
                          style={{
                            width: "84px",
                            height: "84px",
                            objectFit: "cover",
                            borderRadius: "14px",
                            border: "1px solid #ddd4c7",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = THUMBS[0];
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "17px",
                              color: "#1f1f1f",
                              marginBottom: "6px",
                            }}
                          >
                            {p.product_name}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              fontSize: "14px",
                              color: "#6b645b",
                            }}
                          >
                            {p._category?.category_name ? (
                              <span>
                                Category: <strong>{p._category.category_name}</strong>
                              </span>
                            ) : null}
                            <span>{currency.format(Number(p.price || 0))}</span>
                            <span>Stock: {Number(p.stock ?? 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-ui btn-secondary-ui"
                          onClick={() => openEditProduct(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-ui btn-secondary-ui"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <Modal
        show={showEditCat}
        onHide={() => setShowEditCat(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label
            htmlFor="edit-category-name"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Category name
          </label>
          <input
            id="edit-category-name"
            type="text"
            className="form-input"
            value={editCatName}
            onChange={(e) => setEditCatName(e.target.value)}
            placeholder="Category name"
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-ui btn-secondary-ui"
            onClick={() => setShowEditCat(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-ui btn-primary-ui"
            onClick={saveCategory}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditProd}
        onHide={() => setShowEditProd(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <div>
              <label
                htmlFor="edit-product-name"
                style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
              >
                Product name
              </label>
              <input
                id="edit-product-name"
                type="text"
                className="form-input"
                value={editProd?.product_name || ""}
                onChange={(e) =>
                  setEditProd((prev) => ({
                    ...prev,
                    product_name: e.target.value,
                  }))
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  htmlFor="edit-product-price"
                  style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                >
                  Price
                </label>
                <input
                  id="edit-product-price"
                  type="text"
                  className="form-input"
                  value={editProd?.price || ""}
                  onChange={(e) =>
                    setEditProd((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-stock"
                  style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
                >
                  Stock
                </label>
                <input
                  id="edit-product-stock"
                  type="text"
                  className="form-input"
                  value={editProd?.stock || ""}
                  onChange={(e) =>
                    setEditProd((prev) => ({
                      ...prev,
                      stock: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-product-category"
                style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
              >
                Category
              </label>
              <select
                id="edit-product-category"
                className="form-input"
                value={editProd?.category_id || ""}
                onChange={(e) =>
                  setEditProd((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-product-thumb"
                style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
              >
                Thumbnail
              </label>
              <select
                id="edit-product-thumb"
                className="form-input"
                value={editProd?.image_url || THUMBS[0]}
                onChange={(e) =>
                  setEditProd((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
              >
                {THUMBS.map((thumb) => (
                  <option key={thumb} value={thumb}>
                    {thumb}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "4px",
              }}
            >
              <img
                src={editProd?.image_url || THUMBS[0]}
                alt="Preview"
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "1px solid #ddd4c7",
                }}
                onError={(e) => {
                  e.currentTarget.src = THUMBS[0];
                }}
              />
              <div style={{ fontSize: "14px", color: "#6b645b" }}>
                Updated thumbnail preview.
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-ui btn-secondary-ui"
            onClick={() => setShowEditProd(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-ui btn-primary-ui"
            onClick={saveProduct}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e4dccf",
        borderRadius: "14px",
        background: "#fcfaf6",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b645b",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "28px",
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