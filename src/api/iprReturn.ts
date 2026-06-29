import { api } from './client';
import type {
  IprReturnRequest,
  IprReturnUpdateRequest,
  IprReturnResponse,
} from '@/types/iprReturn';

export const iprReturnApi = {
  getAll: () => api.get<IprReturnResponse[]>('/ipr-return/get').then((r) => r.data),

  getById: (id: number) =>
    api.get<IprReturnResponse>(`/ipr-return/get/${id}`).then((r) => r.data),

  getByEmployeeId: (employeeId: number) =>
    api
      .get<IprReturnResponse[]>(`/ipr-return/get/employee/${employeeId}`)
      .then((r) => r.data),

  add: (data: IprReturnRequest) =>
    api.post<IprReturnResponse>('/ipr-return/add', data).then((r) => r.data),

  update: (id: number, data: IprReturnUpdateRequest) =>
    api.put<IprReturnResponse>(`/ipr-return/update/${id}`, data).then((r) => r.data),

  submit: (id: number) =>
    api.put<IprReturnResponse>(`/ipr-return/update/${id}/submit`).then((r) => r.data),

  approve: (id: number) =>
    api.put<IprReturnResponse>(`/ipr-return/update/${id}/approve`).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/ipr-return/delete/${id}`).then((r) => r.data),
};
