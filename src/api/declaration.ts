import { api } from './client';
import type { IprDeclarationRequest, IprDeclarationResponse } from '@/types/declaration';

export const declarationApi = {
  getByIprId: (iprId: number) =>
    api
      .get<IprDeclarationResponse>(`/declaration/get/${iprId}`)
      .then((r) => r.data),

  add: (data: IprDeclarationRequest) =>
    api.post<IprDeclarationResponse>('/declaration/add', data).then((r) => r.data),

  update: (id: number, data: IprDeclarationRequest) =>
    api
      .put<IprDeclarationResponse>(`/declaration/update/${id}`, data)
      .then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/declaration/delete/${id}`).then((r) => r.data),
};
