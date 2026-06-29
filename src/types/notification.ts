// Mirrors com.nic.ipr.dto.request.IprNotificationRequest
export interface IprNotificationRequest {
  title: string;
  message: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string;
  active?: boolean;
}

// Mirrors com.nic.ipr.dto.response.IprNotificationResponse
export interface IprNotificationResponse {
  id: number;
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
