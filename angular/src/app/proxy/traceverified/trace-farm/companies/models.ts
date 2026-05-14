import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CompanyDto extends AuditedEntityDto<string> {
  logo?: string;
  gS1Code?: string;
  name?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: string;
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  nationName?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  websiteUrl?: string;
  latitude?: number;
  longitude?: number;
  tenantId?: string;
  tenantName?: string;
  adminEmailAddress?: string;
  adminPassword?: string;
  userName?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CompanyFilterDto extends RequestCustomDto {
  provinceId?: string;
  districtId?: string;
  wardId?: string;
}

export interface CompanyProfileDto extends AuditedEntityDto<string> {
  name?: string;
  marketId?: string;
  marketName?: string;
  productCategoryId?: string;
  productCategoryName?: string;
  companyName?: string;
  description?: string;
  companyId?: string;
  certificateImages: string[];
  certificateImagesBase64: string[];
}

export interface CompanyProfileFilterDto extends RequestCustomDto {
  marketId?: string;
  productCategoryId?: string;
}

export interface CreateUpdateCompanyDto {
  logo?: string;
  gS1Code: string;
  name: string;
  emailAddress: string;
  phoneNumber?: string;
  address?: string;
  nationId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  websiteUrl?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  tenantId?: string;
  tenantName: string;
  adminEmailAddress: string;
  adminPassword: string;
  isActive?: boolean;
}

export interface CreateUpdateCompanyProfileDto {
  name: string;
  marketId: string;
  productCategoryId: string;
  companyName?: string;
  description?: string;
  certificateImages: string[];
  tenantId?: string;
  companyId?: string;
}

export interface CreateUpdateReceptacleDto {
  code: string;
  description?: string;
}

export interface ReceptacleDto extends AuditedEntityDto<string> {
  code?: string;
  description?: string;
}

export interface ReceptacleFilterDto extends RequestCustomDto {
  code?: string;
}
