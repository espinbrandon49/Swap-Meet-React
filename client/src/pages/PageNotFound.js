import React from 'react'
import { Link } from "react-router-dom"

const PageNotFound = () => {
  return (
    <div className='container page-not-found text-center'>
      <h2 className='featured-items' >PageNotFound</h2>
      <h3 className='mb-4'>¯\_(ツ)_/¯</h3>
      <h4 className='fs-4 '>
        Try this link: &nbsp;
        <Link className='fs-4' to="/">Home Page</Link>
      </h4>

    </div>
  )
}

export default PageNotFound