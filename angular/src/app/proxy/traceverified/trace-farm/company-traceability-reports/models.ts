import type { RequestCustomDto } from '../share/models';

export interface CompanyTraceabilityReportDto {
  companyId?: string;
  companyName?: string;
  productName?: string;
  numberOfProducts: number;
  suppliers: SupplierDto[];
  customer?: string;
  numberOfNotes: number;
  createdDate?: string;
  viewTraceabilityUrl?: string;
  stepRecordId?: string;
  shareRecordId?: string;
  traceabilityCode?: string;
  sourceTenantId?: string;
  endNumber: number;
  status: number;
  lotId?: string;
}

export interface CompanyTraceabilityReportFilter extends RequestCustomDto {
  companyId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SupplierDto {
  name?: string;
  redirectUrl?: string;
}
