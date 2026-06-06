import axiosInstance from './axiosInstance';

export const getMyProfile = () =>
  axiosInstance.get('/api/v1/employee/me');

export const getAllEmployees = () =>
  axiosInstance.get('/api/v1/employee');

export const getEmployeeById = (id) =>
  axiosInstance.get(`/api/v1/employee/${id}`);

export const createEmployee = (data) =>
  axiosInstance.post('/api/v1/employee', data);

export const updateEmployee = (id, data) =>
  axiosInstance.put(`/api/v1/employee/${id}`, data);
