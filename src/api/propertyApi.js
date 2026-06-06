import axiosInstance from './axiosInstance';

export const getPropertiesByIpr = (iprId) =>
  axiosInstance.get(`/api/v1/property/ipr/${iprId}`);

export const createProperty = (data) =>
  axiosInstance.post('/api/v1/property', data);

export const updateProperty = (id, data) =>
  axiosInstance.put(`/api/v1/property/${id}`, data);

export const deleteProperty = (id) =>
  axiosInstance.delete(`/api/v1/property/${id}`);
