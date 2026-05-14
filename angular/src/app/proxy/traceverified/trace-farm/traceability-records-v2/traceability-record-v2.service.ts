import type { CreateUpdateRecordShareDto, CreateUpdateStepReportFirstDto, CreateUpdateStepReportLastDto, CreateUpdateStepReportNormalDto, ProcessRecordFilterDto, ProcessRecordOutputDto, RecordExportResponseDto, RecordReceptionV2Dto, RecordShareDto, StartAndEndGenerateDto, StepReportDoneDto, StepReportDoneFilterDto, StepReportDto, StepReportFilterDto, StepReportReceivedDto, StepReportShareFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { ProcessFieldResponseDto } from '../process-managements/models';
import type { DropdownForStepDto, DropdownItemBaseDto, DropdownItemForMobileDto, EnumItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class TraceabilityRecordV2Service {
  apiName = 'Default';
  

  checkStampNumberInputByStampNumber = (stampNumber: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/traceability-record-v2/check-stamp-number-input',
      params: { stampNumber },
    },
    { apiName: this.apiName,...config });
  

  deleteReception = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'DELETE',
      url: `/api/app/traceability-record-v2/${id}/reception`,
    },
    { apiName: this.apiName,...config });
  

  deleteRecordShare = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'DELETE',
      url: `/api/app/traceability-record-v2/${id}/record-share`,
    },
    { apiName: this.apiName,...config });
  

  deleteStepRecord = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'DELETE',
      url: `/api/app/traceability-record-v2/${id}/step-record`,
    },
    { apiName: this.apiName,...config });
  

  generateStampNumber = (numberOfStamps: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StartAndEndGenerateDto>({
      method: 'POST',
      url: '/api/app/traceability-record-v2/generate-stamp-number',
      params: { numberOfStamps },
    },
    { apiName: this.apiName,...config });
  

  getExcelFile = (stampId: string, clientUrl: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RecordExportResponseDto>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/excel-file/${stampId}`,
      params: { clientUrl },
    },
    { apiName: this.apiName,...config });
  

  getFirstStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/first-step-report',
      params: { stepStatus: input.stepStatus, createdBy: input.createdBy, processStepId: input.processStepId, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getLastStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/last-step-report',
      params: { stepStatus: input.stepStatus, createdBy: input.createdBy, processStepId: input.processStepId, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getNormalStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/normal-step-report',
      params: { stepStatus: input.stepStatus, createdBy: input.createdBy, processStepId: input.processStepId, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getProcessRecord = (input: ProcessRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessRecordOutputDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/process-record',
      params: { createdBy: input.createdBy, processIds: input.processIds, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getReception = (stepRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<RecordReceptionV2Dto>>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/reception/${stepRecordId}`,
    },
    { apiName: this.apiName,...config });
  

  getReceptionDropdown = (processStepId: string, stepRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/reception-dropdown',
      params: { processStepId, stepRecordId },
    },
    { apiName: this.apiName,...config });
  

  getReceptionDropdownForMobile = (processStepId: string, stepRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemForMobileDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/reception-dropdown-for-mobile',
      params: { processStepId, stepRecordId },
    },
    { apiName: this.apiName,...config });
  

  getRecordShare = (stepRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<RecordShareDto>>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/record-share/${stepRecordId}`,
    },
    { apiName: this.apiName,...config });
  

  getRecordShareDetail = (recordShareId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CreateUpdateRecordShareDto>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/record-share-detail/${recordShareId}`,
    },
    { apiName: this.apiName,...config });
  

  getStepDropdown = (processId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownForStepDto>>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/step-dropdown/${processId}`,
    },
    { apiName: this.apiName,...config });
  

  getStepRecordDone = (input: StepReportDoneFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDoneDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/step-record-done',
      params: { productIds: input.productIds, profileIds: input.profileIds, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getStepRecordDropdown = (processStepId: string, entityIds: string[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/step-record-dropdown/${processStepId}`,
      params: { entityIds },
    },
    { apiName: this.apiName,...config });
  

  getStepRecordDropdownMobile = (processStepId: string, entityIds: string[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemForMobileDto>>({
      method: 'GET',
      url: `/api/app/traceability-record-v2/step-record-dropdown-mobile/${processStepId}`,
      params: { entityIds },
    },
    { apiName: this.apiName,...config });
  

  getStepRecordReceived = (input: StepReportShareFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportReceivedDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/step-record-received',
      params: { productIds: input.productIds, partnerIds: input.partnerIds, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getStepRecordShared = (input: StepReportShareFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportReceivedDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/step-record-shared',
      params: { productIds: input.productIds, partnerIds: input.partnerIds, creationDateStart: input.creationDateStart, creationDateEnd: input.creationDateEnd, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getStepReportStatus = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<EnumItemBaseDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/step-report-status',
    },
    { apiName: this.apiName,...config });
  

  getStepResponseByStepIdAndStepRecordIdAndEntityValue = (stepId: string, stepRecordId: string, entityValue: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ProcessFieldResponseDto>>({
      method: 'GET',
      url: '/api/app/traceability-record-v2/step-response',
      params: { stepId, stepRecordId, entityValue },
    },
    { apiName: this.apiName,...config });
  

  saveListRecordResponse = (input: CreateUpdateStepReportFirstDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'POST',
      url: '/api/app/traceability-record-v2/save-list-record-response',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveListRecordResponseLast = (input: CreateUpdateStepReportLastDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'POST',
      url: '/api/app/traceability-record-v2/save-list-record-response-last',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveListRecordResponseNormal = (input: CreateUpdateStepReportNormalDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'POST',
      url: '/api/app/traceability-record-v2/save-list-record-response-normal',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveRecordResponse = (input: CreateUpdateStepReportFirstDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/traceability-record-v2/save-record-response',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveRecordResponseLast = (input: CreateUpdateStepReportLastDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/traceability-record-v2/save-record-response-last',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveRecordResponseNormal = (input: CreateUpdateStepReportNormalDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/traceability-record-v2/save-record-response-normal',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  setStepRecordDone = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: `/api/app/traceability-record-v2/${id}/set-step-record-done`,
    },
    { apiName: this.apiName,...config });
  

  setStepRecording = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: `/api/app/traceability-record-v2/${id}/set-step-recording`,
    },
    { apiName: this.apiName,...config });
  

  setStepRecordingByRecordShare = (recordShareId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: `/api/app/traceability-record-v2/set-step-recording-by-record-share/${recordShareId}`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
