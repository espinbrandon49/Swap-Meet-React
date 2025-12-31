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
    const [authLoaded, setAuthLoaded] = useState(false);

    const logout = () => {
        // clean up both keys (you used "token" previously)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const login = async (username, password) => {
        const { data } = await api.post("/api/users/login", { username, password });

        // ✅ standardize on accessToken
        const token = data.token;
        localStorage.setItem("accessToken", token);
        localStorage.removeItem("token"); // cleanup legacy key

        // backend returns: { token, username, id }
        const nextUser = { id: data.id, username: data.username };
        setUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));
    };

    // ✅ re-hydrate on refresh / direct URL
    useEffect(() => {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

        // No token = auth check complete
        if (!token) {
            setAuthLoaded(true);
            return;
        }

        // normalize storage (move legacy token -> accessToken)
        localStorage.setItem("accessToken", token);
        localStorage.removeItem("token");

        // Try JWT first
        const payload = parseJwt(token);

        // Fallback to stored user (most reliable for your UI)
        const storedUserRaw = localStorage.getItem("user");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        // If JWT has id, prefer that; keep username from storage if needed
        if (payload?.id) {
            setUser({
                id: payload.id,
                username: payload.username || storedUser?.username || "seller",
            });
            setAuthLoaded(true);
            return;
        }

        // If JWT lacks id but we have stored user, use it
        if (storedUser?.id) {
            setUser(storedUser);
            setAuthLoaded(true);
            return;
        }

        // Otherwise treat as logged out
        setUser(null);
        setAuthLoaded(true);
    }, []);

    useEffect(() => setOnUnauthorized(() => logout), []);

    return (
        <AuthContext.Provider value={{ user, authLoaded, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
