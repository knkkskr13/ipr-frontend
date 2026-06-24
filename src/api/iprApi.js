import axiosInstance from './axiosInstance';

// GET /api/v1/ipr-return/get
export const getAllIprReturns = () =>
  axiosInstance.get('/api/v1/ipr-return/get');

// GET /api/v1/ipr-return/get/{id}
export const getIprReturnById = (id) =>
  axiosInstance.get(`/api/v1/ipr-return/get/${id}`);

// GET /api/v1/ipr-return/get/employee/{employeeId}
export const getIprReturnsByEmployee = (employeeId) =>
  axiosInstance.get(`/api/v1/ipr-return/get/employee/${employeeId}`);

// POST /api/v1/ipr-return/add
// Body: { employee: { id }, reportingYear, asOnDate, totalAnnualIncome, isNoProperty }
export const createIprReturn = (data) =>
  axiosInstance.post('/api/v1/ipr-return/add', data);

// PUT /api/v1/ipr-return/update/{id}
export const updateIprReturn = (id, data) =>
  axiosInstance.put(`/api/v1/ipr-return/update/${id}`, data);

// PUT /api/v1/ipr-return/update/{id}/submit
export const submitIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/update/${id}/submit`);

// PUT /api/v1/ipr-return/update/{id}/approve
export const approveIprReturn = (id) =>
  axiosInstance.put(`/api/v1/ipr-return/update/${id}/approve`);

// DELETE /api/v1/ipr-return/delete/{id}
export const deleteIprReturn = (id) =>
  axiosInstance.delete(`/api/v1/ipr-return/delete/${id}`);
