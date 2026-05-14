import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateStampDto {
  companyId: string;
  startLotNumber: number;
  endLotNumber: number;
  quantity: number;
  note?: string;
}

export interface StampDto extends AuditedEntityDto<string> {
  companyName?: string;
  companyId?: string;
  startLotNumber: number;
  endLotNumber: number;
  quantity: number;
  createdDate?: string;
  note?: string;
  status: number;
  statusText?: string;
}

export interface StampExportResponseDto {
  fileName?: string;
  data: number[];
}

export interface StampFilterDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
  companyIds: string[];
  fromDate?: string;
  toDate?: string;
}
