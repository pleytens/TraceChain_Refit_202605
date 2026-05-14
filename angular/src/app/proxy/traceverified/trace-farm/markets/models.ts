import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateMarketDto {
  name: string;
  isDefaultForFree?: boolean;
}

export interface MarketDto extends AuditedEntityDto<string> {
  name?: string;
  productCategoryCount: number;
  profileCount: number;
  isDefaultForFree?: boolean;
}
