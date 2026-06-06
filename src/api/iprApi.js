import axiosInstance from './axiosInstance';

// GET /api/v1/ipr-return
export const getAllIprReturns = () =>
  axiosInstance.get('/api/v1/ipr-return');

// GET /api/v1/ipr-return/{id}
export const getIprReturnById = (id) =>
  axiosInstance.get(`/api/v1/ipr-return/${id}`);

// GET /api/v1/ipr-return/employee/{employeeId}
export const getIprReturnsByEmployee = (employeeId) =>
  axiosInstance.get(`/api/v1/ipr-return/employee/${employeeId}`);

// POST /api/v1/ipr-return
// Body: { employee: { id }, reportingYear, asOnDate, totalAnnualIncome, isNoProperty }
export const createIprReturn = (data) =>
  axiosInstance.post('/api/v1/ipr-return', data);

// PUT /api/v1/ipr-return/{id}
export const updateIprReturn = (id, data) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}`, data);

// PUT /api/v1/ipr-return/{id}/submit
export const submitIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}/submit`);

// PUT /api/v1/ipr-return/{id}/approve
export const approveIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/${id}/approve`);

// DELETE /api/v1/ipr-return/{id}
export const deleteIprReturn = (id) =>
  axiosInstance.delete(`/api/v1/ipr-return/${id}`);
