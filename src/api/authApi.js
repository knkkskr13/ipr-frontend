import axiosInstance from './axiosInstance';

// POST /api/v1/auth/login -> { username, password } -> { token }
export const login = (username, password) =>
  axiosInstance.post('/api/v1/auth/login', { username, password });

// POST /api/v1/auth/register -> { username, password, role, employeeId? }
export const register = (data) =>
  axiosInstance.post('/api/v1/auth/register', data);
