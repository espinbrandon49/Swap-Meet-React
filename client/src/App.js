// src/App.js
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
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

// ✅ configured axios client
import api from "./api/client";

function App() {
  return (
    <div className="App bg-light">
      <Router>
        <AppShell />
      </Router>
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const { user, logout, authLoaded } = useContext(AuthContext);

  // Cart badge count (sum quantities)
  const [cartCount, setCartCount] = useState(0);

  const isLoggedIn = !!user?.id;

  const computeCartCount = (cart) => {
    const products = Array.isArray(cart?.products) ? cart.products : [];
    return products.reduce(
      (sum, p) => sum + Number(p?.product_cart?.quantity ?? 1),
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
      // 404 = no cart yet
      if (err?.response?.status === 404) setCartCount(0);
      else setCartCount(0);
    }
  };

  // Refresh when auth rehydrates or user changes
  useEffect(() => {
    if (!authLoaded) return;
    refreshCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, user?.id]);

  // Listen for global cart updates (Category/Product/Profile/Cart dispatch this)
  useEffect(() => {
    const handler = () => refreshCartCount();
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleProfileDropdown = (e) => {
    const value = e.target.value;

    if (!value) return;

    if (value === "MY_SHOP") {
      navigate(`/profile/${user.id}`);
    }

    if (value === "DASHBOARD") {
      navigate("/dashboard");
    }

    if (value === "LOGOUT") {
      logout();
      setCartCount(0);
      navigate("/");
    }

    // reset dropdown selection back to placeholder
    e.target.value = "";
  };

  // Prevent nav “flicker” while auth rehydrates
  if (!authLoaded) return null;

  return (
    <>
      {/* Primary Nav (clean map): Home + Cart + Profile dropdown */}
      <Navbar expand="md">
        <Container className="first-nav">
          <div className="logo-welcome">
            <Navbar.Brand as={Link} to="/" className="fs-1">
              <i className="fa-brands fa-opencart logo-img"></i>
            </Navbar.Brand>

            {user && (
              <Link className="welcome-link link" to={`/profile/${user.id}`}>
                Welcome {user.username}
              </Link>
            )}
          </div>
          <Nav>
            {!user ? (
              <div className="first-nav-items">
                <Link className="link" to="/">
                  Home
                </Link>
                <Link className="link" to="/login">
                  Login
                </Link>
                <Link className="link" to="/registration">
                  Registration
                </Link>
              </div>
            ) : (
              <div className="first-nav-items">
                <Link className="link" to="/">
                  Home
                </Link>

                <Link className="link" to="/cart">
                  {cartCount > 0 ? `Cart (${cartCount})` : "Cart"}
                </Link>

                <div>
                  <label htmlFor="dropdown" className="dropdown-label link">
                    Profile
                  </label>

                  <select
                    className="dropdown"
                    onChange={handleProfileDropdown}
                    name="dropdown"
                    id="dropdown"
                    defaultValue=""
                  >
                    <option className="dropdownItem link" value="">
                      {" "}
                    </option>

                    <option className="dropdownItem link" value="MY_SHOP">
                      My Shop
                    </option>

                    <option className="dropdownItem link" value="DASHBOARD">
                      Dashboard
                    </option>

                    <option className="dropdownItem link" value="LOGOUT">
                      Logout
                    </option>
                  </select>
                </div>
              </div>
            )}
          </Nav>
        </Container>
      </Navbar>

      <div className="container heading">
        <h1 className="heading-text">Swap Meet React</h1>
        <p>
          A gathering at which enthusiasts or collectors trade or exchange items
          of common interest
        </p>
      </div>

      {/* ✅ Removed second-nav completely (Dashboard moved into dropdown) */}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/profile/:id" element={<Profile />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        {/* Protected */}
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

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <footer>
        <div className="media">
          <a
            href="https://github.com/espinbrandon49"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-solid fa-globe icon"></i>
          </a>
          <a
            href="https://github.com/espinbrandon49/Swap-Meet-React"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-github icon"></i>
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
