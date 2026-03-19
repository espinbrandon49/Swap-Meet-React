// src/App.js
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";
import Cart from "./pages/Cart";
import Product from "./pages/Product";
import Dashboard from "./pages/Dashboard";

import { AuthContext } from "./helpers/AuthContext";
import ProtectedRoute from "./helpers/ProtectedRoute";
import api from "./api/client";

function App() {
  return (
    <div className="App">
      <Router>
        <AppShell />
      </Router>
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const { user, logout, authLoaded } = useContext(AuthContext);

  const [cartCount, setCartCount] = useState(0);

  const isLoggedIn = !!user?.id;

  const computeCartCount = (cart) => {
    const products = Array.isArray(cart?.products) ? cart.products : [];
    return products.reduce(
      (sum, product) => sum + Number(product?.product_cart?.quantity ?? 1),
      0
    );
  };

  const refreshCartCount = async () => {
    try {
      if (!isLoggedIn) {
        setCartCount(0);
        return;
      }

      const res = await api.get("/api/cart/me");
      setCartCount(computeCartCount(res.data));
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (!authLoaded) return;
    refreshCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, user?.id]);

  useEffect(() => {
    const handler = () => refreshCartCount();
    window.addEventListener("cart:changed", handler);

    return () => window.removeEventListener("cart:changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    setCartCount(0);
    navigate("/");
  };

  if (!authLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f4ef",
          padding: "24px",
        }}
      >
        <div className="card-ui text-center" style={{ maxWidth: "420px", width: "100%" }}>
          <small>Loading marketplace...</small>
          <h2 style={{ marginTop: "8px", marginBottom: "8px" }}>Preparing Swap Meet React</h2>
          <p className="text-muted" style={{ margin: 0 }}>
            Restoring session and storefront navigation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f4ef 0%, #f3efe7 220px, #f7f4ef 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(247, 244, 239, 0.94)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #ddd4c7",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            padding: "16px 0",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#1f1f1f",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#7c5c3b",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 20px rgba(124, 92, 59, 0.18)",
                fontSize: "20px",
              }}
            >
              <i className="fa-brands fa-opencart"></i>
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                Swap Meet React
              </div>
              <small style={{ display: "block", marginTop: "2px" }}>
                Category-based marketplace MVP
              </small>
            </div>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <ShellNavLink to="/">Home</ShellNavLink>

            {!isLoggedIn ? (
              <>
                <ShellNavLink to="/login">Login</ShellNavLink>
                <ShellNavLink to="/registration">Register</ShellNavLink>
              </>
            ) : (
              <>
                <ShellNavLink to="/cart">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </ShellNavLink>
                <ShellNavLink to={`/profile/${user.id}`}>My Shop</ShellNavLink>
                <ShellNavLink to="/dashboard">Dashboard</ShellNavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-ui btn-secondary-ui"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>

        <div
          style={{
            borderTop: "1px solid #e7dfd2",
            background: "#fbf9f5",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              padding: "12px 0",
              flexWrap: "wrap",
            }}
          >
            <div>
              <small style={{ display: "block", marginBottom: "4px" }}>
                Portfolio rebuild
              </small>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#5f5a52",
                }}
              >
                Browse categories, inspect products, manage your shop, and review cart flow in one cohesive UI.
              </p>
            </div>

            {isLoggedIn ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <small>
                  Signed in as <strong>{user.username}</strong>
                </small>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Link to="/registration" className="btn-ui btn-primary-ui">
                  Start Selling
                </Link>
                <Link to="/login" className="btn-ui btn-secondary-ui">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px 0 56px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>

      <footer
        style={{
          borderTop: "1px solid #ddd4c7",
          background: "#ffffff",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            padding: "20px 0 28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Swap Meet React
            </div>
            <small>
              MERN marketplace portfolio project focused on buyer and seller flow clarity.
            </small>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "20px",
            }}
          >
            <a
              href="https://espinbrandon49.github.io"
              target="_blank"
              rel="noreferrer"
              aria-label="Portfolio"
              style={{ color: "#7c5c3b" }}
            >
              <i className="fa-solid fa-globe"></i>
            </a>
            <a
              href="https://github.com/espinbrandon49/Swap-Meet-React"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              style={{ color: "#7c5c3b" }}
            >
              <i className="fa-brands fa-github"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShellNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: "10px",
        border: isActive ? "1px solid #cdbba5" : "1px solid transparent",
        background: isActive ? "#efe6d8" : "transparent",
        color: "#2a2723",
        fontWeight: 600,
        fontSize: "14px",
        transition: "all 0.2s ease",
      })}
    >
      {children}
    </NavLink>
  );
}

export default App;