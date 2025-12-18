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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Don't log the token value, but provide a debug hint that it's present
    console.debug("API: attaching Authorization header for request", config.method, config.url);
  } else {
    console.debug("API: no token found for request", config.method, config.url);
  }

  return config;
});

API.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      console.warn("API: 401 response - clearing session and redirecting to /login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Trigger a full redirect to the login page so user can sign in again
      try {
        window.location.replace("/login");
      } catch (e) {
        /* noop for non-browser environments */
      }
    }
    return Promise.reject(error);
  }
);

export default API;
