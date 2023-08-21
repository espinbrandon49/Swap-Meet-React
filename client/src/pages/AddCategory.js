import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from "../helpers/AuthContext";

const AddCategory = () => {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login')
    }
  }, [])

  const initialValues = {
    category_name: "",
    username: authState.username
  }

  const validationSchema = Yup.object().shape({
    category_name: Yup.string().min(3).max(15).required("Categories are 3-15 characters")
  })

  const onSubmit = (data, { resetForm }) => {
    axios.post('https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories',
      {
        category_name: data.category_name,
        username: authState.username
      },
      {
        headers: { accessToken: localStorage.getItem("accessToken") },
      }).then((response) => {
        resetForm()
        window.location.replace('https://jovial-belekoy-f030f6.netlify.app/')
      });
  };

  return (
    <>
      <p className='form-title'>Add A Category</p>
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}  >
        <Form className=''>
          <div className='form-elements'>
            <Field
              autoComplete='off'
              id="categoryInput"
              name="category_name"
              className="input-field"
              placeholder="Category Name"
            />
            <button type='submit' className="form-button">Add Category</button>
          </div>
          <div>
            <ErrorMessage
              name="category_name" component='div' className='error-msg' />
          </div>
        </Form>
      </Formik>
    </>
  )
}

export default AddCategory