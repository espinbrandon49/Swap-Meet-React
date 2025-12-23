import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

const Home = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ---------- Fetch ----------
  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        if (mounted) setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        if (mounted) setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchCategories();
    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Derived data ----------
  const productCountByCategoryId = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const cid = p.category_id ?? p.categoryId;
      if (!cid) continue;
      map.set(cid, (map.get(cid) || 0) + 1);
    }
    return map;
  }, [products]);

  const recentProducts = useMemo(() => {
    // Heuristic: prefer higher id as "newer"
    const sorted = [...products].sort((a, b) => (b.id || 0) - (a.id || 0));
    return sorted.slice(0, 6);
  }, [products]);

  const featuredShops = useMemo(() => {
    // derive sellers from categories (requires category rows to include user_id + username)
    const seen = new Map(); // user_id -> { user_id, username, categoryCount, productCount }
    for (const c of categories) {
      const uid = c.user_id ?? c.userId ?? c.owner_id;
      const uname =
        c.username ??
        c.User?.username ??
        c.owner?.username ??
        "Shop";

      if (!uid) continue;

      const current = seen.get(uid) || {
        user_id: uid,
        username: uname,
        categoryCount: 0,
        productCount: 0,
      };

      current.categoryCount += 1;

      // count products in this category
      const cid = c.id;
      current.productCount += productCountByCategoryId.get(cid) || 0;

      seen.set(uid, current);
    }

    // sort by most products, then categories
    return Array.from(seen.values())
      .sort((a, b) => b.productCount - a.productCount || b.categoryCount - a.categoryCount)
      .slice(0, 6);
  }, [categories, productCountByCategoryId]);

  // ---------- UI helpers ----------
  const onSearchSubmit = (e) => {
    e.preventDefault(); // placeholder only
  };

  return (
    <div className="container py-3">
      {/* Search (placeholder) */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Search</Card.Title>

          <Form onSubmit={onSearchSubmit}>
            <Row className="g-2 align-items-center">
              <Col xs={12} md={9}>
                <Form.Control
                  type="text"
                  placeholder="Search products (coming soon)"
                  aria-label="Search products"
                />
              </Col>
              <Col xs={12} md={3}>
                <Button type="submit" className="w-100" variant="dark" disabled>
                  Search
                </Button>
              </Col>
            </Row>
            <small className="text-muted d-block mt-2">
              Placeholder only — wired as a form so we can plug real search in later.
            </small>
          </Form>
        </Card.Body>
      </Card>

      {/* Recent Products */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="featured-items m-0">Recent Products</h2>
        <small className="text-muted">{loadingProducts ? "Loading..." : `${products.length} total`}</small>
      </div>

      <Row className="g-3 mb-4">
        {loadingProducts ? (
          <Col>
            <Card>
              <Card.Body>Loading products…</Card.Body>
            </Card>
          </Col>
        ) : recentProducts.length === 0 ? (
          <Col>
            <Card>
              <Card.Body>No products found.</Card.Body>
            </Card>
          </Col>
        ) : (
          recentProducts.map((p) => (
            <Col key={p.id} xs={12} sm={6} lg={4}>
              <Card className="h-100">
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img
                    src={p.image_url || "https://picsum.photos/400/300"}
                    alt={p.product_name || "Product"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/400/300";
                    }}
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-1">{p.product_name}</Card.Title>
                  <Card.Text className="mb-3">
                    ${Number(p.price || 0).toFixed(2)}
                  </Card.Text>

                  <div className="mt-auto d-flex gap-2">
                    <Button
                      variant="outline-dark"
                      className="w-100"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Categories w/ counts */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="featured-items m-0">Categories</h2>
        <small className="text-muted">{loadingCats ? "Loading..." : `${categories.length} total`}</small>
      </div>

      <Card className="mb-4">
        <ListGroup variant="flush" className="text-center home-list">
          <ListGroup.Item className="border-0 p-3 category-item">
            VIEW BY CATEGORY
          </ListGroup.Item>

          {loadingCats ? (
            <ListGroup.Item className="border-0 p-3">Loading categories…</ListGroup.Item>
          ) : categories.length === 0 ? (
            <ListGroup.Item className="border-0 p-3">No categories found.</ListGroup.Item>
          ) : (
            categories.map((c) => {
              const count = productCountByCategoryId.get(c.id) || 0;
              return (
                <ListGroup.Item
                  key={c.id}
                  className="border-0 p-3 category-item"
                  onClick={() => navigate(`/category/${c.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="link category-name">{c.category_name}</span>
                    <span className="text-muted">{count} item{count === 1 ? "" : "s"}</span>
                  </div>

                  {/* Keep your existing “added by” style if username exists */}
                  {(c.username || c.owner?.username) && (
                    <div className="mt-1">
                      <span className="link category-user">
                        added by {c.username ?? c.owner?.username}
                      </span>
                    </div>
                  )}
                </ListGroup.Item>
              );
            })
          )}
        </ListGroup>
      </Card>

      {/* Shops (Featured Sellers) */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="featured-items m-0">Shops</h2>
        <small className="text-muted">
          {loadingCats || loadingProducts ? "Loading..." : `${featuredShops.length} featured`}
        </small>
      </div>

      <Row className="g-3 mb-5">
        {(loadingCats || loadingProducts) ? (
          <Col>
            <Card>
              <Card.Body>Loading shops…</Card.Body>
            </Card>
          </Col>
        ) : featuredShops.length === 0 ? (
          <Col>
            <Card>
              <Card.Body>
                No shops to feature yet. (Needs categories to include user_id + username.)
              </Card.Body>
            </Card>
          </Col>
        ) : (
          featuredShops.map((s) => (
            <Col key={s.user_id} xs={12} sm={6} lg={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-1">{s.username}</Card.Title>
                  <Card.Text className="text-muted mb-3">
                    {s.categoryCount} categor{s.categoryCount === 1 ? "y" : "ies"} •{" "}
                    {s.productCount} product{s.productCount === 1 ? "" : "s"}
                  </Card.Text>
                  <Button
                    variant="dark"
                    className="mt-auto"
                    onClick={() => navigate(`/profile/${s.user_id}`)}
                  >
                    Visit Shop
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Home;
