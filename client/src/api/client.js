import axios from "axios";

let onUnauthorized = null; // optional callback from AuthContext

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.accessToken = token;  // 👈 match backend
    return config;
});

// Handle 401/403 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if ((status === 401 || status === 403) && typeof onUnauthorized === "function") {
            onUnauthorized(); // e.g., AuthContext.logout()
        }
        return Promise.reject(err);
    }
);

// Allow AuthContext to register a handler for auth failures
export const setOnUnauthorized = (fn) => {
    onUnauthorized = fn;
};

export default api;
