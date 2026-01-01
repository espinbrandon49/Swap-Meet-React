import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

const MAX_RESULTS = 6;

const Home = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");

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
    const sorted = [...products].sort((a, b) => (b.id || 0) - (a.id || 0));
    return sorted.slice(0, MAX_RESULTS);
  }, [products]);

  // ✅ Global search, capped display
  const displayedProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return recentProducts;

    return products
      .filter((p) =>
        (p.product_name || "").toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [products, recentProducts, search]);

  const isSearching = search.trim().length > 0;

  // ---------- UI helpers ----------
  const onSearchSubmit = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => setSearch("");

  return (
    <div className="container py-3">
      {/* Search */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Search</Card.Title>

          <Form onSubmit={onSearchSubmit}>
            <Row className="g-2 align-items-center">
              <Col xs={12} md={9}>
                <Form.Control
                  type="text"
                  placeholder="Search products"
                  aria-label="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>

              <Col xs={6} md={1}>
                <Button
                  type="button"
                  className="w-100"
                  variant="outline-dark"
                  onClick={clearSearch}
                  disabled={!isSearching}
                  title="Clear search"
                >
                  ✕
                </Button>
              </Col>

              <Col xs={6} md={2}>
                <Button type="submit" className="w-100" variant="dark">
                  Search
                </Button>
              </Col>
            </Row>

            {isSearching && (
              <small className="text-muted d-block mt-2">
                Showing top {MAX_RESULTS} matches
              </small>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Products */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="featured-items m-0">
          {isSearching ? "Search Results" : "Recent Products"}
        </h2>
        <small className="text-muted">
          {loadingProducts ? "Loading..." : `${displayedProducts.length} shown`}
        </small>
      </div>

      <Row className="g-3 mb-4">
        {loadingProducts ? (
          <Col>
            <Card>
              <Card.Body>Loading products…</Card.Body>
            </Card>
          </Col>
        ) : displayedProducts.length === 0 ? (
          <Col>
            <Card>
              <Card.Body>
                No results found{isSearching ? ` for "${search.trim()}"` : ""}.
              </Card.Body>
            </Card>
          </Col>
        ) : (
          displayedProducts.map((p) => (
            <Col key={p.id} xs={12} sm={6} lg={4}>
              <Card className="h-100">
                <div className="home-product-img-wrap">
                  <img
                    className="home-product-img"
                    src={p.image_url || "https://picsum.photos/400/300"}
                    alt={p.product_name || "Product"}
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/400/300";
                    }}
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-1">
                    {p.product_name}
                  </Card.Title>
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

      {/* Categories */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="featured-items m-0">Categories</h2>
        <small className="text-muted">
          {loadingCats ? "Loading..." : `${categories.length} total`}
        </small>
      </div>

      <Card className="mb-4">
        <ListGroup variant="flush" className="text-center home-list">
          <ListGroup.Item className="border-0 p-3 category-item">
            VIEW BY CATEGORY
          </ListGroup.Item>

          {loadingCats ? (
            <ListGroup.Item className="border-0 p-3">
              Loading categories…
            </ListGroup.Item>
          ) : categories.length === 0 ? (
            <ListGroup.Item className="border-0 p-3">
              No categories found.
            </ListGroup.Item>
          ) : (
            categories.map((c) => {
              const count = productCountByCategoryId.get(c.id) || 0;
              return (
                <ListGroup.Item
                  key={c.id}
                  className="border-0 p-3 category-item clickable"
                  onClick={() => navigate(`/category/${c.id}`)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="link category-name">
                      {c.category_name}
                    </span>
                    <span className="text-muted">
                      {count} item{count === 1 ? "" : "s"}
                    </span>
                  </div>

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
    </div>
  );
};

export default Home;
