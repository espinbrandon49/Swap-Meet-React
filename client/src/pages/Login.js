import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);

  const navigate = useNavigate()

  function login() {
    const data = { username: username, password: password };

    axios
      .post("https://swapmeetreact-4f408e945efe.herokuapp.com/api/auth/login", data).then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          localStorage.setItem("accessToken", response.data.token)
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true
          });
          navigate(`/profile/${response.data.id}`)
        }
      });
  };

  return (
    <>
      <h2 className="featured-items">Sign In</h2>
      <div className="container form-elements">

        <input
          autoComplete='off'
          className="input-field"
          placeholder="Store Name"
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />

        <input
          autoComplete='off'
          type="password"
          placeholder="Password"
          className="input-field"
          onChange={(event) => {
            setPassword(event.target.value);
          }} />

        <button onClick={login} className="form-button sign-in" >
          Login
        </button>
      </div>
    </>
  );
};

export default Login;
