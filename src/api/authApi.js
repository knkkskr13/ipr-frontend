import axiosInstance from './axiosInstance';

export const login = (username, password) =>
  axiosInstance.post('/api/v1/auth/login', { username, password });

export const register = (data) =>
  axiosInstance.post('/api/v1/auth/register', data);
