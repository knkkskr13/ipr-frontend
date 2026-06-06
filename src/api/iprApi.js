import axiosInstance from './axiosInstance';

export const getAllIprReturns = () =>
  axiosInstance.get('/api/v1/ipr-return');

export const getIprReturnById = (id) =>
  axiosInstance.get(`/api/v1/ipr-return/${id}`);

export const createIprReturn = (data) =>
  axiosInstance.post('/api/v1/ipr-return', data);

export const updateIprReturn = (id, data) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}`, data);

export const deleteIprReturn = (id) =>
  axiosInstance.delete(`/api/v1/ipr-return/${id}`);

export const submitIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}/submit`);

export const approveIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}/approve`);
