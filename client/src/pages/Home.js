import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import api from "../api/client";

export default function Home() {
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

        setCategories(
          Array.isArray(categoriesRes.data) ? categoriesRes.data : []
        );
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

  return (
    <div className="container section">
      <section className="card-ui" style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <small>Marketplace MVP</small>

          <h1 style={{ margin: 0 }}>
            Browse shops by category, then shop products
          </h1>

          <p style={{ margin: 0 }}>
            Swap Meet React is a marketplace where sellers organize products into
            shop-owned categories. Start by browsing categories across shops, then
            drill into products, add items to cart, and review totals before the
            checkout stub.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <a href="#browse-categories" className="btn-ui btn-primary-ui">
              Browse Categories
            </a>
            <a href="#latest-products" className="btn-ui btn-secondary-ui">
              View Latest Products
            </a>
          </div>
        </div>
      </section>

      <section id="browse-categories" style={{ marginBottom: "40px" }}>
        <PageHeader
          title="Browse Categories"
          subtitle="Explore categories across independent shops."
        />

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section id="latest-products">
        <PageHeader
          title="Latest Products"
          subtitle="Direct product entry for shoppers who already know what they want."
        />

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}