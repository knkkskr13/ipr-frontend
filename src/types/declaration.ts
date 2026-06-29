// Mirrors com.nic.ipr.dto.request.IprDeclarationRequest
export interface IprDeclarationRequest {
  iprId: number;
  declarationText?: string;
  agreed: boolean;
  declarationDate: string; // ISO yyyy-MM-dd
  place: string;
  employeeSignature: string;
}

// Mirrors com.nic.ipr.dto.response.IprDeclarationResponse
export interface IprDeclarationResponse {
  declarationId: number;
  iprId: number;
  declarationText: string | null;
  agreed: boolean;
  declarationDate: string;
  place: string;
  employeeSignature: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_DECLARATION_TEXT =
  'I hereby declare that the return enclosed namely, Form - VI are complete, true and correct to the best of my knowledge and belief in respect of information due to be furnished by me under the provision of Rule-18 of the Tripura Civil Services (Conduct) Rules, 1988.';
