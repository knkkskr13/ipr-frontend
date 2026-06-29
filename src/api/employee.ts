import { api } from './client';
import type { EmployeeRequest, EmployeeResponse } from '@/types/employee';

export const employeeApi = {
  getAll: () => api.get<EmployeeResponse[]>('/employee/get').then((r) => r.data),

  getById: (id: number) =>
    api.get<EmployeeResponse>(`/employee/get/${id}`).then((r) => r.data),

  add: (data: EmployeeRequest) =>
    api.post<EmployeeResponse>('/employee/add', data).then((r) => r.data),

  update: (id: number, data: EmployeeRequest) =>
    api.put<EmployeeResponse>(`/employee/update/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/employee/delete/${id}`).then((r) => r.data),
};
