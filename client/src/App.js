import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
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
import { useContext } from "react";
import { AuthContext } from "./helpers/AuthContext";

function App() {
  const { user, logout } = useContext(AuthContext);

  const handleChange = (e) => {
    if (e.target.value === user?.username) {
      window.location.replace(`/profile/${user.id}`);
    }

    if (e.target.value === "Cart") {
      window.location.replace(`/cart/${user.id}`);
    }

    if (e.target.value === "Logout") {
      logout();
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
                  <Link className="link" to="/login">Login</Link>
                  <Link className="link" to="/registration">Registration</Link>
                </div>
              ) : (
                <div className="first-nav-items">
                  <Link className="link" to="/">Home</Link>
                  <div>
                    <label htmlFor="dropdown" className="dropdown-label link">
                      Profile
                    </label>
                    <select
                      className="dropdown"
                      onClick={handleChange}
                      name="dropdown"
                      id="dropdown"
                    >
                      <option className="dropdownItem link"> </option>
                      <option className="dropdownItem link">
                        {user.username}
                      </option>
                      <option className="dropdownItem link">Cart</option>
                      <option className="dropdownItem link">Logout</option>
                    </select>
                  </div>
                </div>
              )}
            </Nav>
          </Container>
        </Navbar>

        <div className="container heading">
          <h1 className="heading-text">Swap Meet React</h1>
          <p>A gathering at which enthusiasts or collectors trade or exchange items of common interest</p>
        </div>

        <Container className="second-nav">
          <Link className="link" to="/addcategory">Add Category</Link>
          <Link className="link" to="/addtag">Add Tag</Link>
          <Link className="link" to="/addproduct">Add Product</Link>
        </Container>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* owner-only */}
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart/:id" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>

        <footer>
          <div className="media">
            <a href="https://github.com/espinbrandon49" target="_blank" rel="noreferrer">
              <i className="fa-solid fa-globe icon"></i>
            </a>
            <a href="https://espinbrandon49.github.io/Brandon-Espinosa-Portfolio/" target="_blank" rel="noreferrer">
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
