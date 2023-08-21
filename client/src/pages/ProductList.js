import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../helpers/AuthContext";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

const ProductList = ({ singleCategory }) => {
  let { id } = useParams();
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState({})
  const { authState } = useContext(AuthContext);
  const [allCategories, setAllCategories] = useState([]);
  const [shoppingCart, setShoppingCart] = useState({})

  useEffect(() => {
    axios.get("https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories").then((response) => {
      setAllCategories(response.data);
    })

    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/${id}`).then((response) => {
      setProducts(response.data);
    });

    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/tags`).then((response) => {
      setTags(response.data);
    });

    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/cart/${id}`).then((response) => {
      setShoppingCart(response.data)
    });
  }, []);

  function nameCategory() {
    let categoryName
    if (allCategories.length > 0) {
      categoryName = allCategories.filter((value, i) => value.id == id)[0].category_name
    }
    return categoryName
  }

  const initialValues = {
    image: "rangerTab.png",
    product_name: "",
    username: authState.username,
    price: "",
    stock: "",
    categoryName: "",
    category_id: "",
    userId: authState.id,
    tagIds: [],
  };

  const validationSchema = Yup.object().shape({
    product_name: Yup.string().min(3).max(15).required("Product names are 3-15 characters long"),
    price: Yup.number().required("Price is a number").positive(),
    stock: Yup.number().required("Stock is an integer").positive().integer(),
    tagIds: Yup.number().required("Please Select A Tag").typeError('Please select at least one tag')
  });

  const onSubmit = (data, { resetForm }) => {
    sendImage()
    axios
      .post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products",
        {
          image: image.name.replace(/\s/g, '').toLowerCase(),
          product_name: data.product_name,
          username: authState.username,
          price: data.price,
          stock: data.stock,
          categoryName: !id ? data.category_id.split(',')[1] : nameCategory(),
          category_id: !id ? data.category_id.split(',')[0] : id,
          userId: authState.id,
          tagIds: data.tagIds,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          const productToAdd = response.data;
          setProducts([...products, data]);
          window.location.replace(`/category/${!id ? data.category_id.split(',')[0] : id}`)
          resetForm();
        }
      });
  };

  // Post image
  const fileOnChange = (event) => {
    setImage(event.target.files[0])
  }

  const sendImage = (event) => {
    let formData = new FormData()
    formData.append('image', image)
    axios
      .post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/upload", formData, {})
      .then((response) => {
        console.log(response)
      })
  }

  const deleteProduct = (id) => {
    axios
      .delete(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        setProducts(
          products.filter((val) => {
            return val.id !== id;
          })
        );
      })
      .then(() => window.location.reload())
  };

  const editProduct = (field, defaultValue, pid) => {
    if (field === "product_name") {
      let newProductName = prompt('Enter new product name', defaultValue);
      axios
        .put("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/productName", {
          newProductName: newProductName,
          id: pid
        },
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          }
        );
      setProducts([...products])
    } else if (field === "price") {
      let newProductPrice = prompt('Enter new price', defaultValue);
      axios
        .put("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/productPrice", {
          newProductPrice: newProductPrice,
          id: pid
        },
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          }
        )
        .then(() => {
          setProducts([...products,]);
        });
    } else {
      let newStock = prompt('Enter new stock count', defaultValue);
      axios
        .put("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/stock", {
          newStock: newStock,
          id: pid
        },
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          }
        );
    }
    window.location.replace(`/category/${id}`)
  }

  //PRODUCT ROUTES
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
      })
      .then(() => toast.success('Product added to your Cart!', {
        transition: Flip,
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }))
  }

  return (
    <>
      <div className="product-wrapper">
        {products.map((value, key) => {
          return (
            <div className="product" key={value.id * 1111} >
              <img className="product-img" src={`https://swapmeetreact-4f408e945efe.herokuapp.com/public/image-${value.image}`} alt={`product that is a ${value.product}`} />
              <div className="product-description" key={value.id + 5005}>
                <h6 className="product-name">
                  {value.product_name}
                  {authState.username === value.username &&
                    <i className="fa-solid fa-pen-to-square product-edit"
                      onClick={() => {
                        if (authState.username === value.username) {
                          editProduct("product_name", value.product_name, value.id)
                        }
                      }}>
                    </i>
                  }
                </h6>
                <h6 className="product-price">
                  Price: ${value.price}
                  {authState.username === value.username &&
                    <i className="fa-solid fa-pen-to-square product-edit"
                      onClick={() => {
                        if (authState.username === value.username) {
                          editProduct("price", value.price, value.id)
                        }
                      }}>
                    </i>
                  }
                </h6>
                <h6 className="product-price">
                  Stock: {value.stock}
                  {
                    authState.username === value.username &&
                    <i className="fa-solid fa-pen-to-square product-edit"
                      onClick={() => {
                        if (authState.username === value.username) {
                          editProduct("stock", value.stock, value.id)
                        }
                      }}>
                    </i>
                  }
                </h6>
                <h6 className="productList-tags">
                  {tags
                    .filter((tag) => {
                      let x = tag.products.map((el) => el.product_name);
                      if (x.includes(value.product_name)) {
                        return tag.tag_name;
                      }
                    })
                    .map((el) => <span> &nbsp; {"#" + el.tag_name}
                    </span>)}
                </h6>
                <div className="product-button">
                  {
                    authState.username === value.username
                      ? <button onClick={() => deleteProduct(value.id)} className="form-button product-button"
                      >
                        Remove
                      </button>
                      : <>
                        <button onClick={() => addToCart(value.id)} className="form-button product-button" >
                          Add
                        </button>
                        < ToastContainer
                          position="top-center"
                          autoClose={3000}
                          hideProgressBar={false}
                          newestOnTop={false}
                          closeOnClick
                          rtl={false}
                          pauseOnFocusLoss
                          draggable
                          pauseOnHover
                          theme="light"
                        />
                      </>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {singleCategory.username === authState.username &&
        <div className="category-addProduct">
          <p className="form-title category-addProduct-title">Add Product</p>
          <Formik onSubmit={onSubmit} initialValues={initialValues} validationSchema={validationSchema}>
            <Form>
              <div className="form-elements container">
                <div className="form-field">
                  <Field
                    autoComplete="off"
                    className="input-field"
                    id="product_nameInput" name="product_name"
                    placeholder="Product name" />
                  <ErrorMessage
                    name="product_name"
                    component="div"
                    className="error-msg"
                  />
                </div>

                <div className="form-field">
                  <Field
                    autoComplete="off"
                    className="input-field"
                    id="priceInput"
                    name="price"
                    placeholder="Price" />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="error-msg"
                  />
                </div>

                <div className="form-field">
                  <Field
                    autoComplete="off"
                    className="input-field"
                    id="stock_nameInput"
                    name="stock"
                    placeholder="Stock" />
                  <ErrorMessage
                    name="stock"
                    component="div"
                    className="error-msg"
                  />
                </div>

                {!id &&
                  <div className="form-field">
                    <Field
                      className="input-field"
                      as="select"
                      name="category_id"
                    >
                      <option>Select A Category</option>
                      {allCategories.map((value, i) => {
                        return <option key={i} value={[value.id, value.category_name]} label={value.category_name}>value.category_name</option>
                      })
                      }
                    </Field>
                    <label>Select Category</label>
                    <ErrorMessage
                      name="category_id"
                      component="div"
                      className="error-msg" />
                  </div>}
              </div>


              <div className="field-tags">
                {tags.map((tag, key) => {
                  return (
                    <div className="tags-input">
                      <Field
                        key={tag.id}
                        type="checkbox"
                        name="tagIds"
                        value={tag.id.toString()} />
                      <label >{tag.tag_name + " "}</label>
                    </div>
                  );
                })}
                <ErrorMessage
                  className="error-msg"
                  name="tagIds" component="div" />
              </div>

              <div className="addProduct-buttons" >
                <input id="file" name="file" type="file" onChange={fileOnChange} className="file-input" />

                <button type="submit" className="form-button addProduct-button">
                  Add Product
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      }
    </>
  );
};

export default ProductList;