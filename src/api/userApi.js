import axiosInstance from './axiosInstance';

// GET /api/v1/user/get/me -> returns logged-in User { id, username, role, employee }
export const getMe = () =>
  axiosInstance.get('/api/v1/user/get/me');
