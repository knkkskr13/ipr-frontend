import axiosInstance from './axiosInstance';

export const getDeclarationByIpr = (iprId) =>
  axiosInstance.get(`/api/v1/declaration/ipr/${iprId}`);

export const createDeclaration = (data) =>
  axiosInstance.post('/api/v1/declaration', data);

export const updateDeclaration = (id, data) =>
  axiosInstance.put(`/api/v1/declaration/${id}`, data);
