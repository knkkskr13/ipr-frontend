import type { IprStatus } from './common';

// Mirrors com.nic.ipr.dto.request.IprReturnRequest (used for POST /ipr-return/add)
export interface IprReturnRequest {
  employeeId: number;
  reportingYear: string;
  asOnDate: string; // ISO yyyy-MM-dd
  totalAnnualIncome: number;
  isNoProperty?: boolean;
}

// Mirrors com.nic.ipr.dto.request.IprReturnUpdateRequest (used for PUT /ipr-return/update/{id})
export interface IprReturnUpdateRequest {
  reportingYear: string;
  asOnDate: string;
  totalAnnualIncome?: number;
  isNoProperty?: boolean;
}

// Mirrors com.nic.ipr.dto.response.IprReturnResponse
export interface IprReturnResponse {
  iprId: number;
  reportingYear: string;
  asOnDate: string;
  totalAnnualIncome: number;
  isNoProperty: boolean;
  status: IprStatus;

  employeeId: number;
  employeeName: string;
  employeeDepartment: string;
  employeePresentPostHeld: string;

  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
