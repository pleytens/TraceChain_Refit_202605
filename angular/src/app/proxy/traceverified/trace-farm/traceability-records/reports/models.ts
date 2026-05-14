import type { ProductDocumentFileDto } from '../../product-managements/models';

export interface CompanyReportDto {
  name?: string;
  gS1Code?: string;
  description?: string;
  address?: string;
  country?: string;
  phoneNumber?: string;
  emailAddress?: string;
  websiteUrl?: string;
  certificationImages: string[];
  tenantId?: string;
}

export interface DiaryReportDto {
  materialTraceCode: string[];
  steps: DiaryReportStepDto[];
}

export interface DiaryReportStepDto {
  stepName?: string;
  recordDate?: string;
  fieldRecords: FieldRecordReportDto[];
}

export interface FieldRecordReportDto {
  fieldName?: string;
  responseText?: string;
  dataType: number;
}

export interface MapInfoReport {
  position: number;
  latitude?: number;
  longitude?: number;
  displayText?: string;
}

export interface ProductReportDto {
  productName?: string;
  productId?: string;
  gtinCode?: string;
  description?: string;
  images: string[];
  videoUrls: string[];
  certificationImages: string[];
  activationDate?: string;
  companyLogo?: string;
  documentFiles: ProductDocumentFileDto[];
}

export interface MapInfoReportV2 {
  isArea: boolean;
  isGetCompanyInfo: boolean;
  position: number;
  latitude?: number;
  longitude?: number;
  displayText?: string;
  redirectUrl?: string;
  companyProfileId?: string;
  productId?: string;
  traceabilityCode?: string;
  createdTime?: string;
  mapInfoReports: MapInfoReportV2[];
}

export interface ProductReportForExportDto extends ProductReportDto {
  quantityItems: number;
}
