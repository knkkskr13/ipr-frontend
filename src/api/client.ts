import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/common';
import { getToken, clearAuth } from '@/utils/tokenStorage';

// All requests go to /api/v1/* which is same-origin in dev (proxied by Vite,
// see vite.config.ts) and same-origin in prod if the frontend is served
// behind the same domain/reverse-proxy as the backend. If the API lives on
// a different origin in production, set VITE_API_BASE_URL.
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend ErrorResponse into a plain Error with a readable message.
// Also clears auth state on 401 so the app can redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      clearAuth();
    }

    const backendMessage = error.response?.data?.message;
    const message =
      backendMessage ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  },
);
