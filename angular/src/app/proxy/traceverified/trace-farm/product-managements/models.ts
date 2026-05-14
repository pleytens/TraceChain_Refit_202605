import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CreateUpdateProductDto {
  gtinCode: string;
  productName: string;
  marketId: string;
  productCategoryId: string;
  link?: string;
  description?: string;
  images: string[];
  videoUrls: string[];
  certificationImages: string[];
  certificationVideoUrls: string[];
  documentFiles: string[];
}

export interface CreateUpdateProductForGenQrDto extends CreateUpdateProductDto {
  tenantId?: string;
  companyId?: string;
}

export interface ProductDocumentFileDto {
  id?: string;
  url?: string;
  name?: string;
}

export interface ProductDto extends AuditedEntityDto<string> {
  gtinCode?: string;
  productName?: string;
  marketId?: string;
  marketName?: string;
  productCategoryId?: string;
  productCategoryName?: string;
  link?: string;
  description?: string;
  companyId?: string;
  certificateImagesBase64: string[];
  certificateImagesUrls: string[];
  certificateImagesName: string[];
  documentFiles: ProductDocumentFileDto[];
  imagesBase64: string[];
  imagesUrls: string[];
  imagesName: string[];
  videoUrls: string[];
}

export interface ProductFilterDto extends RequestCustomDto {
  marketId?: string;
  productCategoryId?: string;
}
