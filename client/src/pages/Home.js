// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import api from "../api/client";

export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadHome = async () => {
      try {
        setLoadingCategories(true);
        setLoadingProducts(true);

        const [categoriesRes, productsRes] = await Promise.all([
          api.get("/api/categories"),
          api.get("/api/products"),
        ]);

        if (!mounted) return;

        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        console.error("Failed to load home:", err);
        if (!mounted) return;
        setCategories([]);
        setProducts([]);
      } finally {
        if (!mounted) return;
        setLoadingCategories(false);
        setLoadingProducts(false);
      }
    };

    loadHome();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredCategories = useMemo(() => categories.slice(0, 6), [categories]);
  const latestProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "grid", gap: "28px" }}>
        <section
          className="card-ui"
          style={{
            padding: "32px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(124, 92, 59, 0.06) 0%, rgba(124, 92, 59, 0) 55%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "grid", gap: "14px" }}>
              <small>Marketplace MVP</small>

              <h1
                style={{
                  margin: 0,
                  fontSize: "42px",
                  lineHeight: 1.08,
                  maxWidth: "760px",
                }}
              >
                Browse shop-owned categories, discover products, and move through
                one clear marketplace flow
              </h1>

              <p
                className="text-muted"
                style={{
                  margin: 0,
                  maxWidth: "760px",
                  fontSize: "16px",
                  lineHeight: 1.75,
                }}
              >
                Swap Meet React is a category-based marketplace where sellers
                organize products into their own shop structure. Start with
                categories, explore product pages, add items to cart, and follow
                the buyer journey through a cleaner portfolio-grade interface.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "4px",
                }}
              >
                <a href="#browse-categories" className="btn-ui btn-primary-ui">
                  Browse Categories
                </a>
                <a href="#latest-products" className="btn-ui btn-secondary-ui">
                  Jump to Products
                </a>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
                gap: "14px",
              }}
            >
              <HomeStatCard
                label="Categories"
                value={loadingCategories ? "..." : categories.length}
              />
              <HomeStatCard
                label="Products"
                value={loadingProducts ? "..." : products.length}
              />
              <HomeStatCard
                label="Buyer Flow"
                value="Cart"
                compactText={true}
              />
              <HomeStatCard
                label="Seller Flow"
                value="Shop"
                compactText={true}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div className="card-ui" style={{ padding: "24px" }}>
            <PageHeader
              title="Start with categories"
              subtitle="Categories are the clearest way to understand how this marketplace is organized."
            />

            <p
              className="text-muted"
              style={{
                margin: 0,
                lineHeight: 1.7,
                maxWidth: "760px",
              }}
            >
              Sellers own categories, and products live inside them. That means
              the cleanest way to browse the marketplace is to begin with the
              storefront structure, then drill into items from there.
            </p>
          </div>

          <div
            className="card-ui"
            style={{
              padding: "22px",
              display: "grid",
              gap: "14px",
            }}
          >
            <small>How to explore</small>

            <div style={{ display: "grid", gap: "12px" }}>
              <FlowRow step="1" title="Browse categories" />
              <FlowRow step="2" title="Open a product" />
              <FlowRow step="3" title="Add to cart" />
            </div>

            <button
              type="button"
              className="btn-ui btn-secondary-ui"
              onClick={() => navigate("/registration")}
            >
              Create Seller Account
            </button>
          </div>
        </section>

        <section id="browse-categories" style={{ display: "grid", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <PageHeader
              title="Browse Categories"
              subtitle="Explore categories across independent shops and use them as the main entry into the marketplace."
            />

            {!loadingCategories && categories.length > 0 ? (
              <div className="text-muted">
                {categories.length} categor{categories.length === 1 ? "y" : "ies"}
              </div>
            ) : null}
          </div>

          {loadingCategories ? (
            <LoadingState
              title="Loading categories..."
              message="Pulling category data across shops."
            />
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories available yet"
              message="Once sellers create categories, they will appear here."
            />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "20px",
                }}
              >
                {featuredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>

              {categories.length > featuredCategories.length ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    className="text-muted"
                    style={{ marginBottom: "12px" }}
                  >
                    Showing {featuredCategories.length} of {categories.length} categories
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section
          id="latest-products"
          className="card-ui"
          style={{
            padding: "24px",
            display: "grid",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <PageHeader
              title="Latest Products"
              subtitle="For shoppers who already know what they want, here is a direct path into current listings."
            />

            {!loadingProducts && products.length > 0 ? (
              <div className="text-muted">
                {products.length} product{products.length === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>

          {loadingProducts ? (
            <LoadingState
              title="Loading products..."
              message="Fetching the latest marketplace items."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products available yet"
              message="Check back after sellers add items to their shops."
            />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "20px",
                }}
              >
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length > latestProducts.length ? (
                <div
                  className="text-muted"
                  style={{ textAlign: "center" }}
                >
                  Showing {latestProducts.length} of {products.length} products
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function HomeStatCard({ label, value, compactText = false }) {
  return (
    <div
      style={{
        border: "1px solid #e4dccf",
        borderRadius: "16px",
        background: "#fcfaf6",
        padding: "18px",
        display: "grid",
        gap: "8px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b645b",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: compactText ? "24px" : "30px",
          fontWeight: 700,
          color: "#1f1f1f",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FlowRow({ step, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "999px",
          background: "#efe6d8",
          border: "1px solid #d9c9b4",
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          color: "#7c5c3b",
          flexShrink: 0,
        }}
      >
        {step}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f1f1f",
        }}
      >
        {title}
      </div>
    </div>
  );
}