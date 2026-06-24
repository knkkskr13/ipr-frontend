import axiosInstance from './axiosInstance';

// GET /api/v1/property/get/ipr/{iprId}
export const getPropertiesByIpr = (iprId) =>
  axiosInstance.get(`/api/v1/property/get/ipr/${iprId}`);

// GET /api/v1/property/get
export const getAllProperties = () =>
  axiosInstance.get('/api/v1/property/get');

// GET /api/v1/property/get/{id}
export const getPropertyById = (id) =>
  axiosInstance.get(`/api/v1/property/get/${id}`);

// POST /api/v1/property/add
// Body: { iprReturn: { iprId }, locationAddress, propertyType, ... }
export const createProperty = (data) =>
  axiosInstance.post('/api/v1/property/add', data);

// PUT /api/v1/property/update/{id}
export const updateProperty = (id, data) =>
  axiosInstance.put(`/api/v1/property/update/${id}`, data);

// DELETE /api/v1/property/delete/{id}
export const deleteProperty = (id) =>
  axiosInstance.delete(`/api/v1/property/delete/${id}`);
