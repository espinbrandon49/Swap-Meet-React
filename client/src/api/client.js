import axios from "axios";

let onUnauthorized = null;

const api = axios.create({
    baseURL: "http://localhost:3001",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.accessToken = token;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if ((status === 401 || status === 403) && typeof onUnauthorized === "function") {
            onUnauthorized();
        }
        return Promise.reject(err);
    }
);

export const setOnUnauthorized = (fn) => {
    onUnauthorized = fn;
};

export default api;
