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
      <div className="app-loading-shell">
        <div className="card-ui text-center app-loading-card">
          <small>Loading marketplace...</small>
          <h2 className="mt-1 mb-1">Preparing Swap Meet React</h2>
          <p className="text-muted mb-0">
            Restoring your session and navigation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header__top">
          <Link to="/" className="brand-link">
            <div className="brand-mark">
              <i className="fa-brands fa-opencart"></i>
            </div>

            <div>
              <div className="brand-name">Swap Meet React</div>
              <small className="brand-subtitle">Category-based marketplace</small>
            </div>
          </Link>

          <nav className="site-nav">
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
                <ShellNavLink to={`/profile/${user.id}`}>Your Shop</ShellNavLink>
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

        <div className="site-header__subbar">
          <div className="container site-header__subbar-inner">
            <div>
              <small className="mb-1">Marketplace</small>
              <p className="site-header__subbar-copy">
                Browse categories, view products, manage your listings, and
                review your cart in one place.
              </p>
            </div>

            {isLoggedIn ? (
              <div className="site-header__actions">
                <small>
                  Signed in as <strong>{user.username}</strong>
                </small>
              </div>
            ) : (
              <div className="site-header__actions">
                <Link to="/registration" className="btn-ui btn-primary-ui">
                  Create Account
                </Link>
                <Link to="/login" className="btn-ui btn-secondary-ui">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
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

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div>
            <div className="site-footer__title">Swap Meet React</div>
            <small>
              A category-based marketplace with browsing, shop management, and
              cart flow.
            </small>
          </div>

          <div className="site-footer__icons">
            <a
              href="https://espinbrandon49.github.io"
              target="_blank"
              rel="noreferrer"
              aria-label="Portfolio"
              className="site-footer__icon-link"
            >
              <i className="fa-solid fa-globe"></i>
            </a>
            <a
              href="https://github.com/espinbrandon49/Swap-Meet-React"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="site-footer__icon-link"
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
      className={({ isActive }) =>
        `shell-nav-link${isActive ? " active" : ""}`
      }
    >
      {children}
    </NavLink>
  );
}

export default App;