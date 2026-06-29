// Mirrors com.nic.ipr.dto.request.PropertyRequest
export interface PropertyRequest {
  iprId: number;
  locationAddress: string;
  propertyType: string;
  propertyDescription?: string;
  acquisitionCost?: number;
  acquisitionYear?: number;
  presentValue?: number;
  ownerName: string;
  ownerRelation: string; // SELF / SPOUSE / DEPENDENT
  acquisitionMode?: string; // Purchase / Inheritance / Gift / ...
  acquisitionDetails?: string;
  annualIncome?: number;
  remarks?: string;
}

// Mirrors com.nic.ipr.dto.response.PropertyResponse
export interface PropertyResponse {
  propertyId: number;
  iprId: number;
  locationAddress: string;
  propertyType: string;
  propertyDescription: string | null;
  acquisitionCost: number | null;
  acquisitionYear: number | null;
  presentValue: number | null;
  ownerName: string;
  ownerRelation: string;
  acquisitionMode: string | null;
  acquisitionDetails: string | null;
  annualIncome: number | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export const OWNER_RELATIONS = ['SELF', 'SPOUSE', 'DEPENDENT'] as const;
export const ACQUISITION_MODES = [
  'Purchase',
  'Inheritance',
  'Gift',
  'Lease',
  'Mortgage',
  'Other',
] as const;
