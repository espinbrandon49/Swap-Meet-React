// src/helpers/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import api, { setOnUnauthorized } from "../api/client";

export const AuthContext = createContext();

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const logout = () => {
        // clean up both keys (you used "token" previously)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        setUser(null);
    };

    const login = async (username, password) => {
        const { data } = await api.post("/api/users/login", { username, password });

        // ✅ standardize on accessToken
        const token = data.token;
        localStorage.setItem("accessToken", token);
        localStorage.removeItem("token"); // cleanup legacy key

        // backend returns: { token, username, id }
        setUser({ id: data.id, username: data.username });
    };

    // ✅ re-hydrate on refresh / direct URL
    useEffect(() => {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;

        // normalize storage (move legacy token -> accessToken)
        localStorage.setItem("accessToken", token);
        localStorage.removeItem("token");

        const payload = parseJwt(token);
        // payload shape depends on backend, but most include id/username
        if (payload?.id && payload?.username) {
            setUser({ id: payload.id, username: payload.username });
        }
    }, []);

    useEffect(() => setOnUnauthorized(() => logout), []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
