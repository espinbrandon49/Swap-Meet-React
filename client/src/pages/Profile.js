import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';
import { AuthContext } from "../helpers/AuthContext";

const Profile = ({ logout }) => {
  let { id } = useParams();
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const navigate = useNavigate();
  const { authState, setAuthState } = useContext(AuthContext);

  useEffect(() => {
    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/basicinfo/${id}`).then((response) => {
      setUsername(response.data.username);
      setImage(response.data.image);
    });

    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories/byuserId/${id}`).then((response) => {
      setUserCategories(response.data);
    });

    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/productbyuserId/${id}`).then((response) => {
      setUserProducts(response.data);
    });

    axios.get("https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories").then((response) => {
      setAllCategories(response.data);
    });
  }, []);

  const editUsername = (defaultValue) => {
    let newUsername = prompt('Enter new name \n Logout Required');
    let uid = authState.id;
    let pid = userProducts.map((value, i) => value.id);
    let cid = userCategories.map((value, i) => value.id);
    axios
      .put("https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/changeusername", {
        newUsername: newUsername,
        uid: uid,
        pid: pid,
        cid: cid
      },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          console.log(response.data.token)
          localStorage.setItem("accessToken", response.data.token)
          setAuthState({
            username: newUsername,
            id: uid,
            status: true
          });
        }
      })
      .then(() => {
        setAuthState({ ...authState, username: newUsername })
      })
    window.location.replace(`https://jovial-belekoy-f030f6.netlify.app/profile/${authState.id}`)
  }

  const addToCart = (pid) => {
    axios
      .post('https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/addtocart',
        {
          pid: pid
        },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
      .then((response) => {
        console.log(response.data)
      });
  }

  return (
    <div className="container profile-items">
      <div className="profile-header">
        <div >
          <img className="profile-img" src={`https://swapmeetreact-4f408e945efe.herokuapp.com/public/image-${image}`} />
        </div>
        <h2 className="featured-items">
          {authState.username === username
            ? "Your Shop"
            : username}
        </h2>
        <div>
          {authState.id == id &&
            <button onClick={() => editUsername(authState.username)} className="form-button">Update Name</button>
          }
        </div>
      </div>

      {userCategories.map((value, key) => {
        return (
          <div
            className="category-list"
            key={value.id + 100}>
            <ListGroup
              key={value.id}
              className=""
              onClick={() => { navigate(`/category/${value.id}`); }}
            >
              <ListGroup.Item
                key={value.id + 200}
                className="border-0 p-0 link category-item category-name name-profile">
                {value.category_name}
              </ListGroup.Item>
            </ListGroup>

            <div className="product-wrapper">
              {userProducts
                .filter((category, i) => category.categoryName === value.category_name)
                .map((product, i) => (
                  <div className="product" key={value.id + 400}>
                    <img className="product-img"
                      src={`https://swapmeetreact-4f408e945efe.herokuapp.com/public/image-${product.image}`} />
                    <div className="product-description" key={value.id + 500}>
                      <h6 className="product-name">{product.product_name}</h6>
                      <p className="product-price">Price: ${product.price}</p>
                      <div className="product-button">
                        {authState.id == id
                          ? <button className="form-button product-button" onClick={() => {
                            navigate(`/category/${product.category_id}`);
                          }}>Update</button>
                          : <button className="form-button product-button" onClick={() => {
                            addToCart(product.id);
                          }}>Add To Cart</button>
                        }
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default Profile;