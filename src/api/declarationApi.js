import axiosInstance from './axiosInstance';

// GET /api/v1/declaration/get/{iprId}
export const getDeclarationByIpr = (iprId) =>
  axiosInstance.get(`/api/v1/declaration/get/${iprId}`);

// POST /api/v1/declaration/add
// Body matches IprDeclaration entity: { iprReturn: { iprId }, declarationText, agreed, declarationDate, place, employeeSignature }
export const createDeclaration = (data) =>
  axiosInstance.post('/api/v1/declaration/add', data);

// PUT /api/v1/declaration/update/{id}
export const updateDeclaration = (id, data) =>
  axiosInstance.put(`/api/v1/declaration/update/${id}`, data);

// DELETE /api/v1/declaration/delete/{id}
export const deleteDeclaration = (id) =>
  axiosInstance.delete(`/api/v1/declaration/delete/${id}`);
