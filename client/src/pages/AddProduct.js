import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../helpers/AuthContext";

const AddProduct = () => {
  let { id } = useParams();
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState({})
  const { authState } = useContext(AuthContext);
  const [allCategories, setAllCategories] = useState([]);

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
  }, []);

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
    product_name: Yup.string().min(3).max(15).required("Must be 3-15 characters"),
    price: Yup.number().required("Price is a number").positive(),
    stock: Yup.number().required("Stock is an integer").positive().integer(),
    // category_id: Yup.number().required("Please select a category").typeError('Please select a category'),
    tagIds: Yup.number().required("Please select a tag").typeError('Please select a tag')
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
          categoryName: data.category_id.split(',')[1],
          category_id: data.category_id.split(',')[0],
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

  return (
    <div className="container">
      <p className="form-title">Add Product</p>
      <Formik onSubmit={onSubmit} initialValues={initialValues} validationSchema={validationSchema}>
        <Form >
          <div className="form-elements ">
            <div className="form-field">
              <Field
                autoComplete="off"
                className="input-field"
                id="product_nameInput"
                name="product_name"
                placeholder="Product name" />
              <ErrorMessage
                name="product_name" component="div"
                className="error-msg"
              />
            </div>

            <div className="form-field">
              <Field autoComplete="off"
                className="input-field"
                id="priceInput"
                name="price"
                placeholder="Price" />
              <ErrorMessage
                className="error-msg"
                name="price"
                component="div" />
            </div>

            <div className="form-field">
              <Field autoComplete="off"
                className="input-field"
                id="stock_nameInput"
                name="stock"
                placeholder="Stock" />
              <ErrorMessage
                className="error-msg"
                name="stock"
                component="div" />
            </div>

            {!id &&
              <div className="form-field">
                <Field
                  className="input-field"
                  as="select"
                  name="category_id">
                  <option>Select A Category</option>
                  {
                    allCategories
                      .filter((myCategories, id) => myCategories.username === authState.username)
                      .map((value, i) => {
                        return <option key={i} value={[value.id, value.category_name]} label={value.category_name}>value.category_name</option>
                      })
                  }
                </Field>
                {/* <ErrorMessage name="category_id" component="div"
                  className="error-msg" /> */}
              </div>}
          </div>

          <div className="field-tags">
            {tags.map((tag, key) => {
              return (
                <div className="tags-input">
                  <Field
                    key={key}
                    type="checkbox"
                    name="tagIds"
                    value={tag.id.toString()} />
                  <label className="tag-label">{tag.tag_name}</label>
                </div>
              );
            })}
            <ErrorMessage
              className="error-msg"
              name="tagIds" component="div" />
          </div>

          <div className="addProduct-buttons" >
            <input
              id="file"
              name="file"
              type="file"
              onChange={fileOnChange}
              className="file-input" />
            <button
              type="submit"
              className="form-button addProduct-button">
              Add Product
            </button>
          </div>
        </Form>
      </Formik>

    </div>
  )
}

export default AddProduct
