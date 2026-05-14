import type { RequestCustomDto } from '../share/models';

export interface GtinCodeReportDto {
  scanDate?: string;
  traceabilityCode?: string;
  numberOfScans: number;
  numberOfDevices: number;
  id?: string;
}

export interface GtinCodeReportFilterDto extends RequestCustomDto {
  fromDate?: string;
  toDate?: string;
  productId?: string;
}

export interface LatLongReportDto {
  latitude?: number;
  longitude?: number;
}

export interface ProductScanDto {
  productId?: string;
  name?: string;
  gtinCode?: string;
  numberOfScans: number;
}

export interface UserInteractionFilterDto extends RequestCustomDto {
}

export interface ViewCountDto {
  objectType: number;
  objectId?: string;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
}
