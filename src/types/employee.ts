// Mirrors com.nic.ipr.dto.request.EmployeeRequest
export interface EmployeeRequest {
  name: string;
  email: string;
  service: string;
  department: string;
  lengthOfService: string;
  presentPostHeld: string;
  placeOfPosting: string;
}

// Mirrors com.nic.ipr.dto.response.EmployeeResponse
export interface EmployeeResponse {
  id: number;
  name: string;
  email: string;
  service: string;
  department: string;
  lengthOfService: string;
  presentPostHeld: string;
  placeOfPosting: string;
}
