import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((config: any) => {
  const lang = localStorage.getItem("lang") || "en";
  const token = localStorage.getItem("token");

  config.headers["Content-Type"] = "application/json";
  config.headers["Accept"] = "application/json";
  config.headers["Accept-Language"] = lang;

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

API.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default API;
