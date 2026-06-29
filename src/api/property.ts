import { api } from './client';
import type { PropertyRequest, PropertyResponse } from '@/types/property';

export const propertyApi = {
  getAll: () => api.get<PropertyResponse[]>('/property/get').then((r) => r.data),

  getById: (id: number) =>
    api.get<PropertyResponse>(`/property/get/${id}`).then((r) => r.data),

  getByIprId: (iprId: number) =>
    api.get<PropertyResponse[]>(`/property/get/ipr/${iprId}`).then((r) => r.data),

  add: (data: PropertyRequest) =>
    api.post<PropertyResponse>('/property/add', data).then((r) => r.data),

  update: (id: number, data: PropertyRequest) =>
    api.put<PropertyResponse>(`/property/update/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/property/delete/${id}`).then((r) => r.data),
};
