import axiosInstance from './axiosInstance';

// GET /api/v1/property/ipr/{iprId}
export const getPropertiesByIpr = (iprId) =>
  axiosInstance.get(`/api/v1/property/ipr/${iprId}`);

// POST /api/v1/property
// Body: { iprReturn: { iprId }, locationAddress, propertyType, ... }
export const createProperty = (data) =>
  axiosInstance.post('/api/v1/property', data);

// PUT /api/v1/property/{id}
export const updateProperty = (id, data) =>
  axiosInstance.put(`/api/v1/property/${id}`, data);

// DELETE /api/v1/property/{id}
export const deleteProperty = (id) =>
  axiosInstance.delete(`/api/v1/property/${id}`);
