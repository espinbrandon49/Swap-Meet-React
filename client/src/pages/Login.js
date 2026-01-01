import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(username.trim(), password);
      navigate("/"); 
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container login-page">
      <h2 className="featured-items">Sign In</h2>
      <div className="form-elements">
        <input
          autoComplete="off"
          className="input-field"
          placeholder="Store Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          autoComplete="off"
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} className="form-button sign-in">
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
