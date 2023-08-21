import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';


const AddTag = () => {
  const [tagAdded, setTagAdded] = useState({ status: false, tag: '' })
  let navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login')
    }
  }, [])

  const initialValues = {
    tag_name: ""
  }

  const validationSchema = Yup.object().shape({
    tag_name: Yup.string().min(3).max(15).required("Tag are 3-15 characters")
  })

  const onSubmit = (data, { resetForm }) => {
    axios.post('https://swapmeetreact-4f408e945efe.herokuapp.com/api/tags', data)
    .then((response) => {
      resetForm()
      setTagAdded({ status: true, tag: data.tag_name })
      // navigate('/addproduct')
    })
    .then(() => toast.success('Tag Added', {
      transition: Flip,
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    }))
  };

  return (
    <>
      <p className='form-title'>Add A Tag</p>
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}  >
        <Form className='form'>
          <div className='form-elements'>
            <Field
              autoComplete='off'
              id="tagInput"
              name="tag_name"
              className="input-field"
              placeholder="Tag Name"
            />
            <button type='submit' className="form-button">Add Tag</button>
          </div>
          <ErrorMessage name="tag_name" component='div' className='error-msg' />
          < ToastContainer
            position="bottom-right"
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
        </Form>
      </Formik>
      {/* <span className=""> {tagAdded.status && tagAdded.tag + " " + "Tag Added"}</span> */}
    </>
  )
}

export default AddTag