import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  async (config) => {
    let token = getToken();
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
    if (error.response.status === 401) {
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", refreshResponse.data.accessToken);
        error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const logout = async () => {
  try {
      await api.post("/auth/logout");
  } catch (error) {
      console.error("Logout failed", error);
  }
  localStorage.removeItem("token"); 
  window.location.href = "/login"; 
};

export default api;
