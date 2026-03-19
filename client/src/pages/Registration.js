import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../helpers/AuthContext";
import AuthFormShell from "../components/AuthFormShell";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/api/users", { username: username.trim(), password });
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <AuthFormShell
      title="Registration"
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleRegister}
      submitLabel="Register"
    />
  );
};

export default Registration;