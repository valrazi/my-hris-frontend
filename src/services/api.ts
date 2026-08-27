import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL pointing to the NestJS Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Main authenticated Axios instance for backend Gateway requests
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Clear session storage & redirect to login if unauthenticated
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Unauthenticated Axios instance specifically for Direct S3/R2 Presigned Uploads (Step B)
export const s3DirectUploadClient = axios.create();
