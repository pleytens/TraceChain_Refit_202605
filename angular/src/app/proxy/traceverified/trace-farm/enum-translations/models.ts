import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateEnumTranslationDto {
  enumKey: number;
  enumValue: string;
  enumType: string;
  language: string;
}

export interface EnumTranslationDto extends AuditedEntityDto<string> {
  enumKey: number;
  enumValue?: string;
  enumType?: string;
  language?: string;
}

export interface EnumTranslationFilterDto {
  enumType?: string;
}
