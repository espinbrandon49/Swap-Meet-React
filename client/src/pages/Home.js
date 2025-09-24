import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
// import AddCategory from './AddCategory';
// import AddTag from './AddTag';
import api from "../api/client"; 

const Home = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  return (
    <div className='container'>
      <div className='mx-auto'>
        <ListGroup className='text-center home-list'>
          <ListGroup.Item className='border-0 p-0 category-item'>
            VIEW BY CATEGORY
          </ListGroup.Item>
          {categories.map((value) => (
            <ListGroup.Item
              key={value.id}
              className="border-0 p-0 category-item"
              onClick={() => navigate(`/category/${value.id}`)}
            >
              <span className='link category-name'>{value.category_name}</span>
              <span className='link category-user'>
                added by {value.username}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div>
          <h2 className="featured-items">Featured Items</h2>
        </div>

        <div className='product-samples'>
          <img src={require('../images/product1.png')} alt="product1" />
          <img src={require('../images/product2.png')} alt="product2" />
          <img src={require('../images/product3.png')} alt="product3" />
        </div>
      </div>

      <h4 className='forms-header'>Start your store here!</h4>
      {/* <div className='forms-wrapper'>
        <div>
          <AddCategory />
        </div>
        <div>
          <AddTag />
        </div>
      </div> */}
    </div>
  );
};

export default Home;
