import type { UserRole } from './common';

// Mirrors com.nic.ipr.dto.request.LoginRequest
export interface LoginRequest {
  username: string;
  password: string;
}

// Mirrors com.nic.ipr.dto.request.RegisterRequest
export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  employeeId?: number | null;
}

// Response of POST /auth/login
export interface LoginResponse {
  token: string;
}

// Response of POST /auth/register
export interface RegisterResponse {
  message: string;
}

// Decoded JWT payload shape (sub, role, iat, exp)
export interface DecodedToken {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

// Mirrors com.nic.ipr.entity.User (returned by GET /user/get/me)
// employee is only populated when role === EMPLOYEE
export interface CurrentUser {
  id: number;
  username: string;
  role: UserRole;
  employee: {
    id: number;
    name: string;
    email: string;
    service: string;
    department: string;
    lengthOfService: string;
    presentPostHeld: string;
    placeOfPosting: string;
  } | null;
}
