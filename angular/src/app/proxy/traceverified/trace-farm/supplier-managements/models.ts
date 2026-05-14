import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CreateUpdateSupplierDto {
  code: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  nationId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
}

export interface SupplierDto extends AuditedEntityDto<string> {
  code?: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
}

export interface SupplierFilterDto extends RequestCustomDto {
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
}
