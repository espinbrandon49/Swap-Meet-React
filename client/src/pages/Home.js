import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="container">
      <div className="page-shell">
        <section className="card-ui hero-card">
          <div className="hero-grid">
            <div className="hero-copy">
              <small>Marketplace System</small>

              <h1 className="hero-title">
                Browse storefronts, explore categories, and view products across
                a structured marketplace system
              </h1>

              <p className="text-muted hero-text">
                Navigate storefronts, explore category structures, and move
                products into your cart through a clear, structured system.
              </p>

              <div className="hero-actions">
                <a href="#browse-categories" className="btn-ui btn-primary-ui">
                  Explore Categories
                </a>
                <a href="#latest-products" className="btn-ui btn-secondary-ui">
                  View Products
                </a>
              </div>
            </div>

            <div className="hero-stat-grid">
              <HomeStatCard
                label="Categories"
                value={loadingCategories ? "..." : categories.length}
              />
              <HomeStatCard
                label="Products"
                value={loadingProducts ? "..." : products.length}
              />
              <HomeStatCard label="Storefronts" value="Public" compactText />
              <HomeStatCard label="Cart" value="Ready" compactText />
            </div>
          </div>
        </section>

        <section className="split-panel">
          <div className="card-ui">
            <PageHeader
              title="Explore Categories"
              subtitle="Categories organize each storefront and provide the clearest navigation path."
            />

            <p className="text-muted mb-0">
              Each storefront is structured by categories, making it easy to move
              from shop to product.
            </p>
          </div>

          <div className="card-ui info-stack">
            <small>How it works</small>

            <div className="flow-list">
              <FlowRow step="1" title="Explore categories" />
              <FlowRow step="2" title="View a product" />
              <FlowRow step="3" title="Add to cart" />
            </div>

            <button
              type="button"
              className="btn-ui btn-secondary-ui"
              onClick={() => navigate("/registration")}
            >
              Create Account
            </button>
          </div>
        </section>

        <section id="browse-categories" className="section-stack">
          <div className="section-head-row">
            <PageHeader
              title="Explore Categories"
              subtitle="Explore categories across independent storefronts."
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
              message="Pulling category data across storefronts."
            />
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories available yet"
              message="Once sellers add categories, they will appear here."
            />
          ) : (
            <>
              <div className="grid-categories">
                {featuredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>

              {categories.length > featuredCategories.length ? (
                <div className="center-note">
                  <div className="text-muted">
                    Showing {featuredCategories.length} of {categories.length} categories
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section id="latest-products" className="card-ui section-stack">
          <div className="section-head-row">
            <PageHeader
              title="Latest Products"
              subtitle="View recently added products across storefronts."
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
              message="Fetching the latest products across storefronts."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products available yet"
              message="Check back after sellers add listings."
            />
          ) : (
            <>
              <div className="grid-products">
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length > latestProducts.length ? (
                <div className="center-note">
                  <div className="text-muted">
                    Showing {latestProducts.length} of {products.length} products
                  </div>
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
    <div className="hero-stat-card">
      <div className="hero-stat-card__label">{label}</div>
      <div
        className={`hero-stat-card__value${
          compactText ? " hero-stat-card__value--compact" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FlowRow({ step, title }) {
  return (
    <div className="flow-row">
      <div className="flow-row__step">{step}</div>
      <div className="flow-row__title">{title}</div>
    </div>
  );
}