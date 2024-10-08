import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;

// Add a request interceptor to attach the JWT
axios.interceptors.request.use(
  (config) => {
    const jwtToken = localStorage.getItem("accessToken");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`; // Attach the token to the Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
