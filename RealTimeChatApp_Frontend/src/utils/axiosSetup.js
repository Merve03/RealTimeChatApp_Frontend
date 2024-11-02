import axios from "axios";
import { TokenService } from "../services/TokenService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  // queue for unauthorized requests (token refresh)
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupAxiosInterceptors = (navigate) => {
  // attach jwt to requests
  axios.interceptors.request.use(
    (config) => {
      const jwtToken = TokenService.getLocalAccessToken();
      if (jwtToken) {
        config.headers.Authorization = `Bearer ${jwtToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // try to refresh token upon unauthorized response
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = TokenService.getLocalRefreshToken();

        return new Promise((resolve, reject) => {
          axios
            .post(`${API_BASE_URL}/account/refresh-token`, { refreshToken })
            .then(({ data }) => {
              TokenService.setTokens(data.data.accessToken, data.data.refreshToken);

              axios.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
              originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

              processQueue(null, data.data.accessToken);
              resolve(axios(originalRequest));
            })
            .catch((err) => {
              // if error while refreshing token
              processQueue(err, null);
              TokenService.removeTokens(); // Clear tokens
              navigate("/login"); // Redirect to login page
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
