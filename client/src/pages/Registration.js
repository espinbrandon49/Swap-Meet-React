import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/api/users", { username: username.trim(), password });
      await login(username.trim(), password); // auto-login
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="container login-page">
      <h2 className="featured-items">Registration</h2>
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
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister} className="form-button">
          Register
        </button>
      </div>
    </div>
  );
};

export default Registration;
