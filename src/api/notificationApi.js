import api from './axiosInstance';

// Get active notification — no auth needed
export const getActiveNotification = () => 
    api.get('/api/v1/ipr-notification/get/active');

// Admin only
export const getAllNotifications = () => 
    api.get('/api/v1/ipr-notification/get');

export const createNotification = (data) => 
    api.post('/api/v1/ipr-notification/add', data);

export const updateNotification = (id, data) => 
    api.put(`/api/v1/ipr-notification/update/${id}`, data);

export const deleteNotification = (id) => 
    api.delete(`/api/v1/ipr-notification/delete/${id}`);