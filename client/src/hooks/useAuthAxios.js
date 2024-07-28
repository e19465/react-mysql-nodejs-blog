import axios from "axios";
import { useNavigate } from "react-router-dom";
export const API_BASE_URL = "http://localhost:5000/api";

const useJwtInterceptorAxios = () => {
  const navigate = useNavigate();
  const jwtAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  };

  jwtAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const errorResponseStatus = error.response?.status;

      if (errorResponseStatus === 403 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              originalRequest.withCredentials = true; // Ensure credentials are sent
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            withCredentials: true,
          });

          if (response.status === 200) {
            return jwtAxios(originalRequest);
          } else {
            localStorage.removeItem("user");
            navigate("/login");
          }
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem("user");
          navigate("/login");
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return jwtAxios;
};

export default useJwtInterceptorAxios;
