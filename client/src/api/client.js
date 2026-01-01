import axios from "axios";

let onUnauthorized = null;

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "https://swap-meet-react-api-aab9152ab59f.herokuapp.com/api",
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
