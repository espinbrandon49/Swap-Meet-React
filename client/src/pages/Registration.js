import React, { useContext, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';

const Registration = () => {

  const [image, setImage] = useState({})

  const initialValues = {
    username: "",
    password: "",
    image: "",
  };

  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate()

  const validationSchema = Yup.object().shape({
    username: Yup.string().min(3).max(14).required("3-15 characters"),
    password: Yup.string().min(4).max(14).required("4-14 characters"),
  });

  const onSubmit = (data) => {
    sendImage()

    axios.post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth",
      {
        username: data.username,
        password: data.password,
        image: image.name.replace(/\s/g, '').toLowerCase(),
      }
    ).then((response) => {
      login(data.username, data.password)
    })
  };

  // Post image
  const fileOnChange = (event) => {
    setImage(event.target.files[0])
  }

  const sendImage = () => {
    let formData = new FormData()
    formData.append('image', image)
    axios
      .post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/upload", formData, {})
      .then((response) => {
        console.log(response)
      })
  }

  function login(data1, data2) {
    const data = { username: data1, password: data2 };
    axios.post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/login", data).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
      } else {
        localStorage.setItem("accessToken", response.data.token)
        setAuthState({
          username: response.data.username,
          id: response.data.id,
          status: true
        });
        navigate('/')
      }
    });
  };

  return (
    <div className="container">
      <h2 className="featured-items">Registration</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        <Form>
          <div className="form-elements">
            <div className="form-field">
              <Field
                autoComplete="off"
                className="input-field"
                id="inputCreatePost"
                name="username"
                placeholder="Store Name" />
              <ErrorMessage name="username" component="div" className="error-msg" />
            </div>
            <div className="form-field">
              <Field
                className="input-field" autoComplete="off"
                id="inputCreatePost"
                name="password"
                type="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="error-msg" />
            </div>
            <button type="submit" className="form-button">Register</button>
            <input id="file" name="file" type="file" onChange={fileOnChange} className="sign-in" />
          </div>
          <div className="">


          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default Registration;
