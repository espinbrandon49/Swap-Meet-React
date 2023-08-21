import React from 'react'
import axios from 'axios'
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";
import ListGroup from 'react-bootstrap/ListGroup';
import AddCategory from './AddCategory';
import AddTag from './AddTag';

const Home = () => {
  const [categories, setCategories] = useState([])

  const { authState } = useContext(AuthContext);

  let navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login')
    } else {
      axios.get('https://swapmeetreact-4f408e945efe.herokuapp.com/api/categories').then((response) => {
        setCategories(response.data)
      })
      navigate('/')
    }
  }, [])

  return (
    <div className='container '>
      <div className='mx-auto'>
        <ListGroup className='text-center home-list'>
          <ListGroup.Item className='border-0 p-0 category-item'>
            VIEW BY CATEGORY
          </ListGroup.Item>
          {categories.map((value, key) => {
            return (
              <ListGroup.Item
                key={value.id}
                className="border-0 p-0 category-item"
                onClick={() => { navigate(`/category/${value.id}`) }}
              >
                <span className='link category-name'>{value.category_name}</span> <span className='link category-user' >added by {authState.username === value.username ? "You" : value.username}</span>
              </ListGroup.Item>
            )
          })}
        </ListGroup>

        <div>
          <h2 className="featured-items">
            Featured Items
          </h2>
        </div>
        
        <div className='product-samples'>
          <img src={require('../images/product1.png')} />
          <img src={require('../images/product2.png')} />
          <img src={require('../images/product3.png')} />
        </div>
      </div>

      <h4 className='forms-header'>Start your store here!</h4>
      <div className='forms-wrapper'>
        <div>
          <AddCategory />
        </div>
        <div>
          <AddTag />
        </div>
      </div>
    </div>
  )
}

export default Home