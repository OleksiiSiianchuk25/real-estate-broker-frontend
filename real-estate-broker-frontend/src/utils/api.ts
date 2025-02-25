import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const refreshResponse = await api.post("/auth/refresh", {}, { withCredentials: true });
        const { accessToken } = refreshResponse.data;
        
        localStorage.setItem("accessToken", accessToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        await logout(); 
      }
    }
    return Promise.reject(error);
  }
);

export const logout = async () => {
  try {
    await api.post("/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed", error);
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  document.cookie = "refreshToken=; Max-Age=0; path=/;"; 
  window.location.href = "/login";
};

export default api;
