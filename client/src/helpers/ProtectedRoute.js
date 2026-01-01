import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, authLoaded } = useContext(AuthContext);

    // Wait for AuthContext to finish rehydrating
    if (!authLoaded) return null;

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
