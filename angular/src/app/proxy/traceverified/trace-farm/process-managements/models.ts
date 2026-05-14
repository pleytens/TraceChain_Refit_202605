import type { AuditedEntityDto } from '@abp/ng.core';
import type { RequestCustomDto } from '../share/models';

export interface CreateUpdateFieldOptionDto {
  id?: string;
  stepId: string;
  name: string;
  dataType: number;
  isObligatory: boolean;
  position: number;
  options: CreateUpdateOptionDto[];
  tenantId?: string;
}

export interface CreateUpdateOptionDto {
  id?: string;
  optionValue?: string;
  tenantId?: string;
}

export interface CreateUpdateProcessDto {
  name: string;
  note?: string;
  logoImage?: string;
}

export interface CreateUpdateProcessStepDto {
  id?: string;
  name?: string;
  description?: string;
  receptacleId?: string;
  processId?: string;
  userTagIds: string[];
  isSpecial?: number;
  position: number;
}

export interface ProcessDetailDto {
  id?: string;
  stepName?: string;
  stepDescription?: string;
  position: number;
  userInStep: string[];
}

export interface ProcessDto extends AuditedEntityDto<string> {
  name?: string;
  note?: string;
  idEditable: boolean;
  imageBase64?: string;
  logoImage?: string;
}

export interface ProcessFieldDto extends AuditedEntityDto<string> {
  stepId?: string;
  name?: string;
  dataType: number;
  isObligatory: boolean;
  position: number;
  options: ProcessFieldOptionDto[];
}

export interface ProcessFieldFilterDto {
  processStepId?: string;
}

export interface ProcessFieldOptionDto {
  id?: string;
  optionValue?: string;
  name?: string;
}

export interface ProcessFieldOptionResponseDto {
  id?: string;
  name?: string;
  entityId?: string;
  selected: boolean;
  responseText?: string;
  executorId?: string;
  processFieldOptionId?: string;
}

export interface ProcessFieldResponseDto {
  id?: string;
  processFieldId?: string;
  name?: string;
  dataType: number;
  isObligatory: boolean;
  position: number;
  processStepResponseId?: string;
  options: ProcessFieldOptionResponseDto[];
  executorId?: string;
}

export interface ProcessFilterDto extends RequestCustomDto {
}

export interface ProcessMobileDto extends AuditedEntityDto<string> {
  name?: string;
  note?: string;
  imageUrl?: string;
}

export interface ProcessStepDto extends AuditedEntityDto<string> {
  name?: string;
  description?: string;
  receptacleCode?: string;
  receptacleId?: string;
  processId?: string;
  questionCount: number;
  userTags: ProcessStepUserDto[];
  isSpecial?: number;
  tenantId?: string;
  position: number;
}

export interface ProcessStepFilterDto extends RequestCustomDto {
  processId?: string;
}

export interface ProcessStepUserDto {
  id?: string;
  name?: string;
}

export interface UpdateStepPositionDto {
  id?: string;
  position: number;
}
