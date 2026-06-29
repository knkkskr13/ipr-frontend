import { api } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CurrentUser,
} from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data).then((r) => r.data),

  getCurrentUser: () =>
    api.get<CurrentUser>('/user/get/me').then((r) => r.data),
};
