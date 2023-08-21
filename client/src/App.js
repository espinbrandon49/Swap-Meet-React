import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import AddCategory from "./pages/AddCategory";
import AddTag from "./pages/AddTag";
import Category from "./pages/Category";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart";
import { AuthContext } from "./helpers/AuthContext"
// username can be accessed everywhere by importing {AuthContext} and using {authState}
//can really add anything you wanted to authState and also modify using setAuthState

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  useEffect(() => {
    axios
      .get("https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/auth", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          setAuthState({ ...authState, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({
      username: "",
      id: 0,
      status: false,
    });
    window.location.replace("/")
  };

  // let timer;

  // const runTimer = () => {
  //   timer = setTimeout(() => {
  //     logout()
  //   }, 1800000)
  // }
  // runTimer();

  // window.addEventListener('click', (e) => {
  //   clearTimeout(timer)
  //   runTimer()
  // })

  // window.addEventListener('mousemove', (e) => {
  //   clearTimeout(timer)
  //   runTimer()
  // })

  // window.addEventListener('scroll', (e) => {
  //   clearTimeout(timer)
  //   runTimer()
  // })

  // window.addEventListener('keydown', (e) => {
  //   clearTimeout(timer)
  //   runTimer()
  // })

  // window.addEventListener('keyup', (e) => {
  //   clearTimeout(timer)
  //   runTimer()
  // })

  const handleChange = (e) => {
    if (e.target.value === authState.username) {
      window.location.replace(`https://jovial-belekoy-f030f6.netlify.app/profile/${authState.id}`)
      console.log(e.target.value)
    }

    if (e.target.value === "Cart") {
      window.location.replace(`https://jovial-belekoy-f030f6.netlify.app/cart/${authState.id}`)
      console.log(e.target.value)
    }

    if (e.target.value === "Logout") {
      logout()
    }
  }

  return (
    <div className="App bg-light">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <Navbar expand="md" >
            <Container className="first-nav">
              <Navbar.Brand href="/" className="fs-1 logo-welcome">
                <i className="fa-brands fa-opencart logo-img"></i>
                {authState.id
                  ? <h6 className='isLink'>
                    <a className="welcome-link link" href={`https://jovial-belekoy-f030f6.netlify.app/profile/${authState.id}`}>
                      Welcome {authState.username}
                    </a>
                  </h6>
                  : null}
              </Navbar.Brand>

              <Nav>
                {!authState.status ? (
                  <div className="first-nav-items">
                    <Link className='link' to="/login">Login</Link>
                    <Link className='link' to="/registration">Registration</Link>
                  </div>
                ) : (
                  <div className="first-nav-items">
                    <Link className='link' to="/">Home</Link>
                    <div >
                      <label htmlFor="dropdown" className="dropdown-label link">
                        Profile
                      </label>
                      <select className="dropdown" onClick={handleChange} name="dropdown" id="dropwdown">
                        <option className='dropdownItem link'> </option>
                        <option className='dropdownItem link'>
                          {authState.username}
                        </option>
                        <option className='dropdownItem link'>Cart</option>
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
            <Link className='link' to="/addcategory">Add Category</Link>
            <Link className='link' to="/addtag">Add Tag</Link>
            <Link className='link' to="/addproduct">Add Product</Link>
          </Container>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/addcategory" exact element={<AddCategory />} />
            <Route path="/addtag" exact element={<AddTag />} />
            <Route path="/addproduct" exact element={<AddProduct />} />
            <Route path="/category/:id" exact element={<Category />} />
            <Route path="/registration" exact element={<Registration />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/profile/:id" exact element={<Profile logout={logout} />} />
            <Route path="/cart/:id" exact element={<Cart />} />
            <Route path="*" exact element={<PageNotFound />} />
          </Routes>
          <footer>
            <div className="media">
              <a href="https://github.com/espinbrandon49" target="_blank" >
                <i className="fa-solid fa-globe icon"></i>
              </a>
              <a href="https://espinbrandon49.github.io/Brandon-Espinosa-Portfolio/"><i className="fa-brands fa-github icon"></i></a>
            </div>
            <p className=''> Project By Brandon Espinosa</p>
          </footer>
        </Router>
      </AuthContext.Provider>
    </div >
  );
}

export default App;
