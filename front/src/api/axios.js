import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
  ,
  // По умолчанию axios считает статусы не из диапазона 2xx ошибкой.
  // Для `GET /api/auth/me` браузер может вернуть `304 Not Modified`,
  // из-за чего React Query уходит в onError и делает logout.
  // Разрешаем 304 как "успешный" статус на уровне клиента.
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304
});

// Request interceptor для добавления токена
axiosInstance.interceptors.request.use(
  (config) => {
    // Берём токен из localStorage, а если там его нет (например, из-за
    // рассинхронизации), пробуем из Zustand-хранилища.
    const tokenFromStorage = localStorage.getItem('accessToken');
    const tokenFromStore = useAuthStore.getState().accessToken;
    const token = tokenFromStorage || tokenFromStore;
    if (token) {
      // На некоторых запросах config.headers может быть undefined
      // (особенно при вызовах с кастомными настройками).
      // В axios v1 headers могут быть AxiosHeaders-объектом.
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок и refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${apiBaseURL}/auth/refresh-token`,
            { refreshToken }
          );

          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Если refresh не удался - выход
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
