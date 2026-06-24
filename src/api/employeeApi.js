import axiosInstance from './axiosInstance';

// GET /api/v1/employee/get
export const getAllEmployees = () =>
  axiosInstance.get('/api/v1/employee/get');

// GET /api/v1/employee/get/{id}
export const getEmployeeById = (id) =>
  axiosInstance.get(`/api/v1/employee/get/${id}`);

// POST /api/v1/employee/add
// Body matches Employee entity: { name, email, service, department, lengthOfService, presentPostHeld, placeOfPosting }
export const createEmployee = (data) =>
  axiosInstance.post('/api/v1/employee/add', data);

// PUT /api/v1/employee/update/{id}
export const updateEmployee = (id, data) =>
  axiosInstance.put(`/api/v1/employee/update/${id}`, data);

// DELETE /api/v1/employee/delete/{id}
export const deleteEmployee = (id) =>
  axiosInstance.delete(`/api/v1/employee/delete/${id}`);
