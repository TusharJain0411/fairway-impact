import axios from "axios";
console.log("Current API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fairwayImpactToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fairwayImpactToken");
      localStorage.removeItem("fairwayImpactUser");
    }

    return Promise.reject(error);
  },
);

export default api;
