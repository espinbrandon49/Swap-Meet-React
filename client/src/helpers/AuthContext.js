import React, { createContext, useState, useEffect } from "react";
import api, { setOnUnauthorized } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        // optional: navigate("/login");
    };

    const login = async (username, password) => {
        const { data } = await api.post("/api/users/login", { username, password });
        localStorage.setItem("token", data.token);
        // backend returns: { token, username, id }
        setUser({ id: data.id, username: data.username });
    };

    useEffect(() => setOnUnauthorized(() => logout), []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
