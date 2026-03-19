import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

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
      <div className="container page-shell-narrow">
        <EmptyState
          title="Dashboard access requires login"
          message="Sign in to manage categories and listings."
          action={
            <button
              type="button"
              className="btn-ui btn-primary-ui"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          }
        />
      </div>
    );
  }

  const totalStock = products.reduce((sum, p) => sum + Number(p?.stock ?? 0), 0);

  return (
    <div className="container">
      <div className="page-shell">
        <section className="card-ui dashboard-hero">
          <div className="dashboard-hero__top">
            <div className="dashboard-hero__copy">
              <Link to={`/profile/${user.id}`} className="dashboard-back-link">
                ← Back to Your Shop
              </Link>

              <PageHeader
                title="Manage Your Shop"
                subtitle="Create categories, add listings, and organize your storefront."
              />
            </div>

            <div className="dashboard-stat-grid">
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
          <div className="dashboard-layout">
            <section className="card-ui dashboard-section">
              <PageHeader
                title="Categories"
                subtitle="Organize your shop structure."
              />

              <div className="field-stack">
                <label htmlFor="new-category-name" className="form-label-ui">
                  Add a category
                </label>

                <div className="field-inline">
                  <input
                    id="new-category-name"
                    type="text"
                    className="input-ui"
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
                  message="Create your first category to organize your shop."
                />
              ) : (
                <div className="dashboard-category-list">
                  {categories.map((c) => {
                    const categoryProducts = Array.isArray(c.products) ? c.products : [];

                    return (
                      <div key={c.id} className="dashboard-category-card">
                        <div className="dashboard-category-card__top">
                          <div>
                            <div className="dashboard-category-card__title">
                              {c.category_name}
                            </div>
                            <div className="dashboard-category-card__meta">
                              {categoryProducts.length} product
                              {categoryProducts.length === 1 ? "" : "s"}
                            </div>
                          </div>

                          <div className="button-row">
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

            <section className="card-ui dashboard-section">
              <PageHeader
                title="Your Listings"
                subtitle="Add products, assign categories, and manage stock."
              />

              <div className="dashboard-product-form">
                <div>
                  <h3 className="mb-1">Add a product</h3>
                  <p className="text-muted mb-0">
                    Choose a category, add price and stock, and select a thumbnail.
                  </p>
                </div>

                <div className="dashboard-product-form__grid">
                  <div className="col-span-6">
                    <label htmlFor="new-product-name" className="form-label-ui">
                      Product name
                    </label>
                    <input
                      id="new-product-name"
                      type="text"
                      className="input-ui"
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

                  <div className="col-span-3">
                    <label htmlFor="new-product-price" className="form-label-ui">
                      Price
                    </label>
                    <input
                      id="new-product-price"
                      type="text"
                      className="input-ui"
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

                  <div className="col-span-3">
                    <label htmlFor="new-product-stock" className="form-label-ui">
                      Stock
                    </label>
                    <input
                      id="new-product-stock"
                      type="text"
                      className="input-ui"
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

                  <div className="col-span-6">
                    <label htmlFor="new-product-category" className="form-label-ui">
                      Category
                    </label>
                    <select
                      id="new-product-category"
                      className="input-ui"
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

                  <div className="col-span-6">
                    <label htmlFor="new-product-thumb" className="form-label-ui">
                      Thumbnail
                    </label>
                    <select
                      id="new-product-thumb"
                      className="input-ui"
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

                <div className="preview-row">
                  <div className="preview-media">
                    <img
                      src={newProd.image_url || THUMBS[0]}
                      alt="Preview"
                      className="preview-thumb"
                      onError={(e) => {
                        e.currentTarget.src = THUMBS[0];
                      }}
                    />
                    <div className="text-muted">Preview for the new product.</div>
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
                  message="Add listings to see category, price, and stock details here."
                />
              ) : (
                <div className="dashboard-product-list">
                  {products.map((p) => (
                    <div key={p.id} className="dashboard-product-card">
                      <div className="dashboard-product-card__main">
                        <img
                          src={p.image_url || THUMBS[0]}
                          alt={p.product_name}
                          className="dashboard-product-card__image"
                          onError={(e) => {
                            e.currentTarget.src = THUMBS[0];
                          }}
                        />

                        <div className="dashboard-product-card__content">
                          <div className="dashboard-product-card__title">
                            {p.product_name}
                          </div>

                          <div className="dashboard-product-card__meta">
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

                      <div className="button-row">
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

      <Modal show={showEditCat} onHide={() => setShowEditCat(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="edit-category-name" className="form-label-ui">
            Category name
          </label>
          <input
            id="edit-category-name"
            type="text"
            className="input-ui"
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

      <Modal show={showEditProd} onHide={() => setShowEditProd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-form-grid">
            <div>
              <label htmlFor="edit-product-name" className="form-label-ui">
                Product name
              </label>
              <input
                id="edit-product-name"
                type="text"
                className="input-ui"
                value={editProd?.product_name || ""}
                onChange={(e) =>
                  setEditProd((prev) => ({
                    ...prev,
                    product_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-grid-2">
              <div>
                <label htmlFor="edit-product-price" className="form-label-ui">
                  Price
                </label>
                <input
                  id="edit-product-price"
                  type="text"
                  className="input-ui"
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
                <label htmlFor="edit-product-stock" className="form-label-ui">
                  Stock
                </label>
                <input
                  id="edit-product-stock"
                  type="text"
                  className="input-ui"
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
              <label htmlFor="edit-product-category" className="form-label-ui">
                Category
              </label>
              <select
                id="edit-product-category"
                className="input-ui"
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
              <label htmlFor="edit-product-thumb" className="form-label-ui">
                Thumbnail
              </label>
              <select
                id="edit-product-thumb"
                className="input-ui"
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

            <div className="preview-media">
              <img
                src={editProd?.image_url || THUMBS[0]}
                alt="Preview"
                className="preview-thumb"
                onError={(e) => {
                  e.currentTarget.src = THUMBS[0];
                }}
              />
              <div className="text-muted">Updated thumbnail preview.</div>
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
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}