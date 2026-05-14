import type { AuditedEntityDto } from '@abp/ng.core';
import type { ExtensibleEntityDto} from '@abp/ng.core';

export interface CreateUpdateUserDto {
  logo?: string;
  name: string;
  code: string;
  email: string;
  phoneNumber: string;
  address: string;
  nationId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  nationName: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  displayName: string;
  userName: string;
  password: string;
  roleNames: string[];
  creationTime: string;
  isActive: boolean;
  lockoutEnabled: boolean;
}

export interface UserDto extends AuditedEntityDto<string> {
  logo?: string;
  tenantId?: string;
  name?: string;
  code?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  nationName?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  creationTime?: string;
  displayName?: string;
  userName?: string;
  password?: string;
  roleNames: string[];
  isActive: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  extraProperties?: any;
}

export interface UserFilterDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
  fromDate?: string;
  toDate?: string;
  nationId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;

}

export interface IdentityRoleDto extends ExtensibleEntityDto<string> {
  name?: string;
  isDefault: boolean;
  isStatic: boolean;
  isPublic: boolean;
  concurrencyStamp?: string;
}

export interface IdentityUserUpdateRolesDto {
  roleNames: string[];
}
