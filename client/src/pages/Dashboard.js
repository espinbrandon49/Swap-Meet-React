// src/pages/Dashboard.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";

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
    const [categories, setCategories] = useState([]); // categories owned by logged-in user
    const [products, setProducts] = useState([]); // products flattened from owned categories

    const reload = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const res = await api.get("/api/categories");
            const all = Array.isArray(res.data) ? res.data : [];

            const mine = all.filter((c) => String(c.user_id) === String(user.id));
            setCategories(mine);

            const flat = [];
            for (const c of mine) {
                const ps = Array.isArray(c.products) ? c.products : [];
                for (const p of ps) flat.push({ ...p, _category: c });
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

    const [newCatName, setNewCatName] = useState("");

    const [showEditCat, setShowEditCat] = useState(false);
    const [editCatId, setEditCatId] = useState(null);
    const [editCatName, setEditCatName] = useState("");

    const openEditCategory = (cat) => {
        setEditCatId(cat.id);
        setEditCatName(cat.category_name || "");
        setShowEditCat(true);
    };

    const addCategory = async () => {
        const name = (newCatName || "").trim();
        if (!name) return;

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
        if (!editCatId || !name) return;

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
            "Delete this category? (Products in it may also be removed depending on your DB cascade.)"
        );
        if (!ok) return;

        try {
            await api.delete(`/api/categories/${catId}`);
            await reload();
        } catch (err) {
            alert(err?.response?.data?.error || "Failed to delete category");
        }
    };

    const [newProd, setNewProd] = useState({
        product_name: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: THUMBS[0],
    });

    const [showEditProd, setShowEditProd] = useState(false);
    const [editProd, setEditProd] = useState(null); // { id, product_name, ... }

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
            <div className="container dashboard-page">
                <h2>Dashboard</h2>
                <p>Login required.</p>
                <Button variant="dark" onClick={() => navigate("/login")}>
                    Login
                </Button>
            </div>
        );
    }

    return (
        <div className="container dashboard-page">
            <div className="dashboard-breadcrumb">
                <Link className="link" to={`/profile/${user.id}`}>
                    ← Back to My Shop
                </Link>
                <span className="dashboard-sep">|</span>
                <span className="dashboard-crumb">Owner Dashboard</span>
            </div>

            <h2 className="dashboard-title">Dashboard</h2>
            <p className="dashboard-subtitle">
                Manage your categories and products. (MVP thumbnails use a static dropdown.)
            </p>

            {loading ? (
                <Card>
                    <Card.Body>Loading…</Card.Body>
                </Card>
            ) : (
                <Row className="g-3">
                    <Col xs={12} lg={5}>
                        <Card>
                            <Card.Body>
                                <Card.Title className="mb-3">Categories</Card.Title>

                                <Form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        addCategory();
                                    }}
                                >
                                    <Row className="g-2 align-items-center">
                                        <Col xs={8}>
                                            <Form.Control
                                                value={newCatName}
                                                onChange={(e) => setNewCatName(e.target.value)}
                                                placeholder="New category name"
                                            />
                                        </Col>
                                        <Col xs={4}>
                                            <Button className="w-100" variant="dark" type="submit">
                                                Add
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>

                                <div className="dashboard-top-spacer">
                                    {categories.length === 0 ? (
                                        <div className="dashboard-empty">No categories yet.</div>
                                    ) : (
                                        <ListGroup>
                                            {categories.map((c) => (
                                                <ListGroup.Item
                                                    key={c.id}
                                                    className="d-flex align-items-center justify-content-between"
                                                >
                                                    <div>
                                                        <div className="dashboard-strong">{c.category_name}</div>
                                                        <div className="dashboard-cat-meta">
                                                            {Array.isArray(c.products) ? c.products.length : 0} product
                                                            {Array.isArray(c.products) && c.products.length === 1 ? "" : "s"}
                                                        </div>
                                                    </div>

                                                    <div className="dashboard-actions">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-dark"
                                                            onClick={() => openEditCategory(c)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => deleteCategory(c.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} lg={7}>
                        <Card>
                            <Card.Body>
                                <Card.Title className="mb-3">Products</Card.Title>

                                <Card className="mb-3">
                                    <Card.Body>
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                addProduct();
                                            }}
                                        >
                                            <Row className="g-2">
                                                <Col xs={12} md={6}>
                                                    <Form.Label className="mb-1">Name</Form.Label>
                                                    <Form.Control
                                                        value={newProd.product_name}
                                                        onChange={(e) =>
                                                            setNewProd((p) => ({ ...p, product_name: e.target.value }))
                                                        }
                                                        placeholder="Product name"
                                                    />
                                                </Col>

                                                <Col xs={6} md={3}>
                                                    <Form.Label className="mb-1">Price</Form.Label>
                                                    <Form.Control
                                                        value={newProd.price}
                                                        onChange={(e) => setNewProd((p) => ({ ...p, price: e.target.value }))}
                                                        placeholder="14.99"
                                                    />
                                                </Col>

                                                <Col xs={6} md={3}>
                                                    <Form.Label className="mb-1">Stock</Form.Label>
                                                    <Form.Control
                                                        value={newProd.stock}
                                                        onChange={(e) => setNewProd((p) => ({ ...p, stock: e.target.value }))}
                                                        placeholder="10"
                                                    />
                                                </Col>

                                                <Col xs={12} md={6}>
                                                    <Form.Label className="mb-1">Category</Form.Label>
                                                    <Form.Select
                                                        value={newProd.category_id}
                                                        onChange={(e) =>
                                                            setNewProd((p) => ({ ...p, category_id: e.target.value }))
                                                        }
                                                    >
                                                        <option value="">Select…</option>
                                                        {categories.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.category_name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>

                                                <Col xs={12} md={6}>
                                                    <Form.Label className="mb-1">Thumbnail (MVP)</Form.Label>
                                                    <Form.Select
                                                        value={newProd.image_url}
                                                        onChange={(e) =>
                                                            setNewProd((p) => ({ ...p, image_url: e.target.value }))
                                                        }
                                                    >
                                                        {THUMBS.map((u) => (
                                                            <option key={u} value={u}>
                                                                {u}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>

                                                <Col xs={12} className="d-flex align-items-center justify-content-between">
                                                    <div className="dashboard-thumb-row">
                                                        <img
                                                            className="dashboard-thumb"
                                                            src={newProd.image_url}
                                                            alt="preview"
                                                            onError={(e) => {
                                                                e.currentTarget.src = THUMBS[0];
                                                            }}
                                                        />
                                                        <div className="dashboard-thumb-note">
                                                            Upgrade later: store URL from Cloudinary/Firebase.
                                                        </div>
                                                    </div>

                                                    <Button variant="dark" type="submit">
                                                        Add Product
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>

                                {products.length === 0 ? (
                                    <div className="dashboard-empty">No products yet.</div>
                                ) : (
                                    <ListGroup>
                                        {products.map((p) => (
                                            <ListGroup.Item
                                                key={p.id}
                                                className="d-flex align-items-center justify-content-between"
                                            >
                                                <div className="dashboard-product-row">
                                                    <img
                                                        className="dashboard-thumb"
                                                        src={p.image_url || THUMBS[0]}
                                                        alt={p.product_name}
                                                        onError={(e) => {
                                                            e.currentTarget.src = THUMBS[0];
                                                        }}
                                                    />

                                                    <div>
                                                        <div className="dashboard-strong">{p.product_name}</div>
                                                        <div className="dashboard-product-meta">
                                                            {p._category?.category_name ? (
                                                                <>
                                                                    Category: <strong>{p._category.category_name}</strong>{" "}
                                                                    <span className="dashboard-dot">•</span>{" "}
                                                                </>
                                                            ) : null}
                                                            ${Number(p.price || 0).toFixed(2)}{" "}
                                                            <span className="dashboard-dot">•</span>{" "}
                                                            Stock: {Number(p.stock ?? 0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="dashboard-actions">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-dark"
                                                        onClick={() => openEditProduct(p)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => deleteProduct(p.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Modal show={showEditCat} onHide={() => setShowEditCat(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        placeholder="Category name"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditCat(false)}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={saveCategory}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditProd} onHide={() => setShowEditProd(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-2">
                        <Col xs={12}>
                            <Form.Label className="mb-1">Name</Form.Label>
                            <Form.Control
                                value={editProd?.product_name || ""}
                                onChange={(e) => setEditProd((p) => ({ ...p, product_name: e.target.value }))}
                            />
                        </Col>

                        <Col xs={6}>
                            <Form.Label className="mb-1">Price</Form.Label>
                            <Form.Control
                                value={editProd?.price || ""}
                                onChange={(e) => setEditProd((p) => ({ ...p, price: e.target.value }))}
                            />
                        </Col>

                        <Col xs={6}>
                            <Form.Label className="mb-1">Stock</Form.Label>
                            <Form.Control
                                value={editProd?.stock || ""}
                                onChange={(e) => setEditProd((p) => ({ ...p, stock: e.target.value }))}
                            />
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="mb-1">Category</Form.Label>
                            <Form.Select
                                value={editProd?.category_id || ""}
                                onChange={(e) => setEditProd((p) => ({ ...p, category_id: e.target.value }))}
                            >
                                <option value="">Select…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.category_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="mb-1">Thumbnail (MVP)</Form.Label>
                            <Form.Select
                                value={editProd?.image_url || THUMBS[0]}
                                onChange={(e) => setEditProd((p) => ({ ...p, image_url: e.target.value }))}
                            >
                                {THUMBS.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </Form.Select>

                            <div className="dashboard-edit-preview">
                                <img
                                    className="dashboard-thumb"
                                    src={editProd?.image_url || THUMBS[0]}
                                    alt="preview"
                                    onError={(e) => {
                                        e.currentTarget.src = THUMBS[0];
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditProd(false)}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={saveProduct}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
