import axiosInstance from './axiosInstance';

// GET /api/v1/employee
export const getAllEmployees = () =>
  axiosInstance.get('/api/v1/employee');

// GET /api/v1/employee/{id}
export const getEmployeeById = (id) =>
  axiosInstance.get(`/api/v1/employee/${id}`);

// POST /api/v1/employee
// Body matches Employee entity: { name, email, service, department, lengthOfService, presentPostHeld, placeOfPosting }
export const createEmployee = (data) =>
  axiosInstance.post('/api/v1/employee', data);

// PUT /api/v1/employee/{id}
export const updateEmployee = (id, data) =>
  axiosInstance.put(`/api/v1/employee/${id}`, data);

// DELETE /api/v1/employee/{id}
export const deleteEmployee = (id) =>
  axiosInstance.delete(`/api/v1/employee/${id}`);
