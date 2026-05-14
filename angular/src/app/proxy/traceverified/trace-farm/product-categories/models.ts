import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateProductCategoryDto {
  name: string;
}

export interface ProductCategoryDto extends AuditedEntityDto<string> {
  name?: string;
  productCount: number;
}
