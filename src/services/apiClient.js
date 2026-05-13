import axios from "axios";

// Central Axios instance — all requests go through this
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://fa-backend.vercel.app/api",
  headers: { "Content-Type": "application/json" },
  timeout: 8000, // 8 seconds timeout
});

// Auto-attach JWT token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fin.token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("fin.token");
      localStorage.setItem("fin.authed", "0");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
