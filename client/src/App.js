import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";
import Cart from "./pages/Cart";
import Product from "./pages/Product";
import Dashboard from "./pages/Dashboard";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./helpers/AuthContext";
import ProtectedRoute from "./helpers/ProtectedRoute";

// ✅ Use your configured axios client (env-based baseURL, token interceptor)
import api from "./api/client";

function App() {
  const { user, logout } = useContext(AuthContext);

  // ✅ Cart badge count (Option 1)
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      if (!user?.id) {
        setCartCount(0);
        return;
      }

      // Cart endpoint: GET /api/cart/:id
      const res = await api.get("/api/cart/me");

      const count = Array.isArray(res.data?.products)
        ? res.data.products.length
        : 0;

      setCartCount(count);
    } catch {
      // MVP: fail silently
      setCartCount(0);
    }
  };

  // Initial refresh when user changes
  useEffect(() => {
    refreshCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Listen for global cart updates from Category/Product
  useEffect(() => {
    const handler = () => refreshCartCount();
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleChange = (e) => {
    const value = e.target.value;

    if (value === user?.username) {
      window.location.replace(`/profile/${user.id}`);
      return;
    }

    if (value === "Cart") {
      window.location.replace(`/cart/${user.id}`);
      return;
    }

    if (value === "Logout") {
      logout();
      // keep badge quiet and consistent after logout
      setCartCount(0);
    }
  };

  return (
    <div className="App bg-light">
      <Router>
        <Navbar expand="md">
          <Container className="first-nav">
            <Navbar.Brand href="/" className="fs-1 logo-welcome">
              <i className="fa-brands fa-opencart logo-img"></i>

              {user && (
                <h6 className="isLink">
                  <Link className="welcome-link link" to={`/profile/${user.id}`}>
                    Welcome {user.username}
                  </Link>
                </h6>
              )}
            </Navbar.Brand>

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

                  <div>
                    <label htmlFor="dropdown" className="dropdown-label link">
                      Profile
                    </label>

                    <select
                      className="dropdown"
                      onChange={handleChange}
                      name="dropdown"
                      id="dropdown"
                      defaultValue=""
                    >
                      <option className="dropdownItem link" value="">
                        {" "}
                      </option>
                      <option className="dropdownItem link" value={user.username}>
                        {user.username}
                      </option>

                      {/* ✅ Option 1: Silent badge update via label only */}
                      <option className="dropdownItem link" value="Cart">
                        {cartCount > 0 ? `Cart (${cartCount})` : "Cart"}
                      </option>

                      <option className="dropdownItem link" value="Logout">
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
            A gathering at which enthusiasts or collectors trade or exchange
            items of common interest
          </p>
        </div>

        {/* Owner/admin links: only show when logged in (still protected by routes too) */}
        {user && (
          <Container className="second-nav">
            <Link className="link" to="/addcategory">
              Add Category
            </Link>
            <Link className="link" to="/addtag">
              Add Tag
            </Link>
            <Link className="link" to="/addproduct">
              Add Product
            </Link>
            <Link className="link" to="/dashboard">
              Dashboard
            </Link>
          </Container>
        )}

        <Routes>
          {/* Public homepage */}
          <Route path="/" element={<Home />} />

          {/* Public browsing routes */}
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Auth pages (public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          {/* Protected routes */}
          <Route
            path="/cart/:id"
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
              href="https://espinbrandon49.github.io/Brandon-Espinosa-Portfolio/"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-github icon"></i>
            </a>
          </div>
          <p>Project By Brandon Espinosa</p>
        </footer>
      </Router>
    </div>
  );
}

export default App;
