import { api } from './client';
import type { IprNotificationRequest, IprNotificationResponse } from '@/types/notification';

export const notificationApi = {
  getAll: () =>
    api.get<IprNotificationResponse[]>('/ipr-notification/get').then((r) => r.data),

  getActive: () =>
    api
      .get<IprNotificationResponse>('/ipr-notification/get/active')
      .then((r) => r.data),

  create: (data: IprNotificationRequest) =>
    api
      .post<IprNotificationResponse>('/ipr-notification/add', data)
      .then((r) => r.data),

  update: (id: number, data: IprNotificationRequest) =>
    api
      .put<IprNotificationResponse>(`/ipr-notification/update/${id}`, data)
      .then((r) => r.data),

  remove: (id: number) =>
    api.delete<void>(`/ipr-notification/delete/${id}`).then((r) => r.data),
};
