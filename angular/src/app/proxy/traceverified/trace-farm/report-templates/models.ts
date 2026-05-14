import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CreateUpdateReportTemplateDto {
  name: string;
  userType: number;
  allowShowFrontNode?: boolean;
  allowShowFullInfo?: boolean;
  allowOnlyArea?: boolean;
  allowShowFollowNode?: boolean;
  allowShowLink?: boolean;
  details: StepAndFieldDto[];
}

export interface FieldDto {
  id?: string;
  name?: string;
  isChecked: boolean;
}

export interface ReportTemplateDto extends AuditedEntityDto<string> {
  name?: string;
  description?: string;
  userType: number;
  userTypeName?: string;
  tenantId?: string;
  allowShowFrontNode?: boolean;
  allowShowFullInfo?: boolean;
  allowOnlyArea?: boolean;
  allowShowFollowNode?: boolean;
  allowShowLink?: boolean;
}

export interface ReportTemplateFilterDto extends RequestCustomDto {
  name?: string;
}

export interface StepAndFieldDto {
  id?: string;
  name?: string;
  fields: FieldDto[];
  isChecked: boolean;
}
