import type { ProcessFieldResponseDto } from '../process-managements/models';
import type { DropdownItemBaseDto, RequestCustomDto } from '../share/models';
import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateRecordReceptionDto {
  id?: string;
  traceabilityRecordId?: string;
  processStepId?: string;
  receptionType: number;
  traceabilityRecordSharedId?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
}

export interface CreateUpdateRecordResponseDto {
  traceabilityRecordId?: string;
  processStepId?: string;
  entityValue?: string;
  entityType: number;
  processStepResponseId?: string;
  fieldResponses: ProcessFieldResponseDto[];
  isDone: boolean;
  status: number;
}

export interface CreateUpdateRecordShareDto {
  traceabilityRecordId?: string;
  productId?: string;
  sourceTenantId?: string;
  sharedTenantId?: string;
  startNumber?: number;
  endNumber: number;
  contractNumber?: string;
  traceabilityCode?: string;
  status: number;
}

export interface CreateUpdateTraceabilityRecordDto {
  processId?: string;
  companyProfileId?: string;
  code?: string;
  contractNumber?: string;
  status: number;
  tenantId?: string;
  currentStepId?: string;
}

export interface RecordReceptionDto {
  id?: string;
  receptionType: number;
  traceabilityRecordSharedId?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
  traceabilityRecordCode?: string;
}

export interface TraceabilityRecordDoneDto {
  id?: string;
  code?: string;
  products: DropdownItemBaseDto[];
  traceabilityCodes: DropdownItemBaseDto[];
  createdBy?: string;
  creationTime?: string;
  viewTraceabilityUrl?: string;
}

export interface TraceabilityRecordDto extends AuditedEntityDto<string> {
  processId?: string;
  processName?: string;
  companyProfileId?: string;
  companyProfileName?: string;
  code?: string;
  createdBy?: string;
  creationTime?: string;
  currentStepName?: string;
  productName?: string;
  status: number;
  currentStepId?: string;
  stepName?: string;
  tenantId?: string;
}

export interface TraceabilityRecordFilterDto extends RequestCustomDto {
  companyProfileId?: string;
  processId?: string;
  fromDate?: string;
  toDate?: string;
  status: number;
}

export interface TraceabilityRecordReceivedDto {
  id?: string;
  code?: string;
  productName?: string;
  traceabilityCode?: string;
  sharedBy?: string;
  partnerName?: string;
  receivedDate?: string;
}

export interface TraceabilityRecordShareDto {
  id?: string;
  code?: string;
  productName?: string;
  traceabilityCode?: string;
  sharedBy?: string;
  partnerName?: string;
  partnerId?: string;
  sendDate?: string;
  contractNumber?: string;
}

export interface TraceabilityRecordingDto {
  id?: string;
  companyProfileName?: string;
  code?: string;
  createdBy?: string;
  creationTime?: string;
  currentStepName?: string;
}
