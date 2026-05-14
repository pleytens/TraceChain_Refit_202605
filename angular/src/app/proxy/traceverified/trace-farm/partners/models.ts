import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CreateUpdatePartnerDto {
  name: string;
  gs1Code: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  nationId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  tenantId?: string;
  companyId?: string;
}

export interface PartnerDto extends AuditedEntityDto<string> {
  gs1Code?: string;
  name?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  companyId?: string;
}

export interface PartnerFilterDto extends RequestCustomDto {
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  nationId?: string;
}
