// Mirrors com.nic.ipr.status.IprStatus exactly
export type IprStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

export type UserRole = 'EMPLOYEE' | 'ADMIN';

// Mirrors com.nic.ipr.exception.ErrorResponse
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
