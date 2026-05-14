import type { ProcessFieldOptionResponseDto } from '../process-managements/models';
import type { DropdownItemBaseDto, RequestCustomDto, StepRecordDropdownDto } from '../share/models';

export interface CompanyCardInfoDto {
  companyProfileId?: string;
  companyName?: string;
  companyLogoUrl?: string;
  createdTime?: string;
  address?: string;
  productName?: string;
  traceabilityCode?: string;
}

export interface CreateUpdateRecordReceptionV2Dto {
  id?: string;
  receptionType: number;
  recordSharedId?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
}

export interface CreateUpdateRecordShareDto {
  recordCodeIds: string[];
  recordCodeSelected: RecordCodeSelectedDto[];
  useAll: number;
  id?: string;
  productId?: string;
  companyProfileId?: string;
  partnerId?: string;
  numberOfStamp: number;
  startNumber: number;
  endNumber: number;
  lotId?: string;
}

export interface CreateUpdateStepReportFirstDto {
  stepReportId?: string;
  processStepId?: string;
  recordStatus: boolean;
  reception: CreateUpdateRecordReceptionV2Dto;
  fieldRecords: FieldRecordDto[];
}

export interface CreateUpdateStepReportLastDto {
  recordShare: CreateUpdateRecordShareDto;
  stepReportId?: string;
  processStepId?: string;
  recordStatus: boolean;
  recordCodeSelected: RecordCodeSelectedDto[];
  fieldRecords: FieldRecordDto[];
  lotId?: string;
}

export interface CreateUpdateStepReportNormalDto {
  stepReportId?: string;
  processStepId?: string;
  recordStatus: boolean;
  fieldRecords: FieldRecordDto[];
  recordCodeSelected: RecordCodeSelectedDto[];
}

export interface DiaryFieldRecordReportDto {
  fieldName?: string;
  responseText?: string;
  dataType: number;
  position: number;
}

export interface DiaryReportStepV2Dto {
  lotId?: string;
  stepName?: string;
  stepType?: number;
  createdTime?: string;
  stepRecords: DiaryStepRecordDto[];
}

export interface DiaryReportV2Dto {
  materialTraceCodes: MaterialTraceCodeDto[];
  steps: DiaryReportStepV2Dto[];
}

export interface DiaryStepRecordDto {
  receptionOrOriginFieldName?: string;
  receptionOrOriginData?: string;
  stepRecordCode?: string;
  redirectUrl?: string;
  fieldRecords: DiaryFieldRecordReportDto[];
}

export interface FieldRecordDto {
  id?: string;
  processFieldId?: string;
  name?: string;
  dataType: number;
  isObligatory: boolean;
  position: number;
  stepRecordId?: string;
  options: ProcessFieldOptionResponseDto[];
  executorId?: string;
}

export interface MaterialTraceCodeDto {
  materialTraceCode?: string;
  redirectUrl?: string;
}

export interface ProcessRecordFilterDto extends RequestCustomDto {
  createdBy: string[];
  processIds: string[];
  creationDateStart?: string;
  creationDateEnd?: string;
}

export interface ProcessRecordOutputDto {
  name?: string;
  stepCount: number;
  createdBy?: string;
  processId?: string;
}

export interface RecordCodeSelectedDto {
  recordCodeId?: string;
  name?: string;
  useAll: boolean;
}

export interface RecordExportResponseDto {
  fileName?: string;
  data: number[];
}

export interface RecordReceptionV2Dto {
  id?: string;
  receptionType: number;
  recordSharedId?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
  displayCode?: string;
}

export interface RecordShareDto {
  id?: string;
  traceabilityCode?: string;
  productName?: string;
  profileName?: string;
  createdBy?: string;
  lotId?: string;
  stepRecordCodeUsed: DropdownItemBaseDto[];
}

export interface StartAndEndGenerateDto {
  startNumber: number;
  endNumber: number;
}

export interface StepRecordDropdownFilterDto {
  processStepId?: string;
  entityIds: string[];
}

export interface StepReportDoneDto {
  id?: string;
  partnerId?: string;
  recordCode?: string;
  traceabilityCode?: string;
  productName?: string;
  profileName?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  viewTraceabilityUrl?: string;
  viewTraceabilityUrlFull?: string;
  isBackEnabled: boolean;
  creationTime?: string;
  numberOfStamps: number;
}

export interface StepReportDoneFilterDto extends RequestCustomDto {
  productIds: string[];
  profileIds: string[];
  creationDateStart?: string;
  creationDateEnd?: string;
}

export interface StepReportDto {
  id?: string;
  code?: string;
  recordStatus?: string;
  recordStatusEnumValue: number;
  processStepId?: string;
  entityCodes: string[];
  stepRecordCodeUsed: StepRecordDropdownDto[];
  entityCodeStr?: string;
  receptionOrOrigin?: string;
  createdBy?: string;
  creationTime?: string;
  lastModifiedBy?: string;
  useAll: number;
  isEditEnabled: boolean;
}

export interface StepReportFilterDto extends RequestCustomDto {
  stepStatus: number[];
  createdBy: string[];
  processStepId?: string;
  creationDateStart?: string;
  creationDateEnd?: string;
}

export interface StepReportReceivedDto {
  id?: string;
  partnerId?: string;
  recordCode?: string;
  traceabilityCode?: string;
  numberOfStamps: number;
  productName?: string;
  lotId?: string;
  partnerName?: string;
  sharedBy?: string;
  creationTime?: string;
  viewTraceabilityUrl?: string;
  viewTraceabilityUrlFull?: string;
}

export interface StepReportShareFilterDto extends RequestCustomDto {
  productIds: string[];
  partnerIds: string[];
  creationDateStart?: string;
  creationDateEnd?: string;
}
