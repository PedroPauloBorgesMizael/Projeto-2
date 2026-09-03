import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token nas requisições futuras
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'token.expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post('http://localhost:3000/auth/refresh-token', { refreshToken });
          
          const { token, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 401) {
      // Any other 401 error (e.g., invalid token, missing token) -> logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
