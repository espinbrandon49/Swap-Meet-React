import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import ProductList from "./ProductList";

const Category = () => {
  let { id } = useParams();
  const [singleCategory, setSingleCategory] = useState({});
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories/${id}`).then((response) => {
      setSingleCategory(response.data);
    });
  }, []);

  const deleteCategory = (id) => {
    if (singleCategory.products.length > 0) {
      alert("Cannot Delete Categories With Products")
    } else {
      axios
        .delete(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories/${id}`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then(() => {
          navigate('/')
        })
    }
  }

  const editCategoryName = (defaultValue) => {
    let newCategoryName = prompt('Enter new category name', defaultValue)
    let pid = singleCategory.products.map((value, i) => value.id)
    axios
      .put("https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories/categoryName", {
        newCategoryName: newCategoryName,
        id: id,
        pid: pid
      },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      );
    setSingleCategory({ ...singleCategory, category_name: newCategoryName })
  }

  return (
    <div className="container">
      <div className="category-header">
        <div className="category-subheader">
          <h2 className="featured-items">
            {singleCategory.category_name}
          </h2>
          {authState.username === singleCategory.username &&
            <i class="fa-solid fa-pen-to-square" onClick={() => editCategoryName(singleCategory.category_name)}></i>
          }
        </div>

        <Link className="link isLink" to={`/profile/${singleCategory.userId}`} ><h2 className="welcome-link">at {singleCategory.username}</h2></Link>

        {authState.username === singleCategory.username &&
          <button onClick={() => { deleteCategory(singleCategory.id) }} className="form-button remove">
            Delete
          </button>
        }
      </div>
      <ProductList singleCategory={singleCategory} />
    </div>
  );
};

export default Category;