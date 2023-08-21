import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

const Cart = () => {
  const { authState } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [cart, setCart] = useState(false);
  const [shoppingCart, setShoppingCart] = useState({});
  const [total, setTotal] = useState(0)
  let { id } = useParams();

  useEffect(() => {
    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/cart/${id}`).then((response) => {
      if (response.data.id > 0) {
        setCart(true)
        setShoppingCart(response.data)
      }
    });
    axios.get(`https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/basicinfo/${id}`).then((response) => {
      setUsername(response.data.username);
    });
  }, [setCart]);

  useEffect(() => {
    setTotal(shoppingCartTotal)
  }, [shoppingCart])

  const shoppingCartTotal = () => {
    let total = 0
    if (shoppingCart.products) {
      for (let i = 0; i < shoppingCart.products.length; i++) {
        total += parseInt(shoppingCart.products[i].price)
      }
    }
    return total
  }

  const createCart = () => {
    axios.post('https://swapmeetreact-4f408e945efe.herokuapp.com/api/cart/createCart',
      {},
      {
        headers: { accessToken: localStorage.getItem("accessToken") },
      }).then((response) => {
        console.log('pink')
        console.log(response.data)
        setCart(true)
      });
    // window.location.reload()
  }

  const removeFromCart = (event) => {
    axios.post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/products/removefromcart",
      {
        pid: event.target.value.split(',')[1],
        cid: event.target.value.split(',')[0]
      }
    )
    window.location.reload()
  }

  const currencyFormat = (num) => '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')


  return (
    <div className="container">
      <div className="cart-header">
        <h2 className="featured-items cart-subheader">Shopping Cart</h2>
        {(!cart)
          ? <button
            className="form-button"
            onClick={createCart}>Create Cart</button>
          : <h3 className="cart-total">Total:{currencyFormat(total)} </h3>}
      </div>

      <>
        {shoppingCart && (
          shoppingCart.products?.length === 0 && (
            <div className="text-center">Shopping Cart Empty</div>
          )
        )}
        {cart && (
          shoppingCart.products?.length > 0 && (
            <div className="product-wrapper product-wrapper-cart">
              {shoppingCart.products.map((value, i) => {
                return (
                  <div className="cart-product" key={i * 333}>
                    <img
                      className="cart-img"
                      src={`https://swapmeetreact-4f408e945efe.herokuapp.com/public/image-${value.image}`}
                    />
                    <h6 className="cart-product-name">
                      {value.product_name}
                    </h6>
                    <p className="product-price">
                      Price: ${value.price}
                    </p>
                    <div>
                      <button
                        className="form-button remove"
                        onClick={removeFromCart}
                        value={[value.product_cart.id, value.id]}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </>
    </div>
  )
}

export default Cart
