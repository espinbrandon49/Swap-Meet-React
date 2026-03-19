import axios from "axios";

let onUnauthorized = null;

const isLocalDev = window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocalDev ? "" : process.env.REACT_APP_API_URL || "",
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