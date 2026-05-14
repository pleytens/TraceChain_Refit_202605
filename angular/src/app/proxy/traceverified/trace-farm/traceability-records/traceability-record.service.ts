import type { CreateUpdateRecordReceptionDto, CreateUpdateRecordResponseDto, CreateUpdateRecordShareDto, CreateUpdateTraceabilityRecordDto, RecordReceptionDto, TraceabilityRecordDoneDto, TraceabilityRecordDto, TraceabilityRecordFilterDto, TraceabilityRecordReceivedDto, TraceabilityRecordShareDto, TraceabilityRecordingDto } from './models';
import type { CompanyReportDto, DiaryReportDto, MapInfoReport, ProductReportDto } from './reports/models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { ProcessFieldDto, ProcessFieldResponseDto } from '../process-managements/models';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class TraceabilityRecordService {
  apiName = 'Default';
  

  create = (input: CreateUpdateTraceabilityRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TraceabilityRecordDto>({
      method: 'POST',
      url: '/api/app/traceability-record',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/traceability-record/${id}`,
    },
    { apiName: this.apiName,...config });
  

  deleteReception = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'DELETE',
      url: `/api/app/traceability-record/${id}/reception`,
    },
    { apiName: this.apiName,...config });
  

  generateRecordCode = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/traceability-record/generate-record-code',
    },
    { apiName: this.apiName,...config });
  

  generateStartNumber = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, number>({
      method: 'POST',
      url: '/api/app/traceability-record/generate-start-number',
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TraceabilityRecordDto>({
      method: 'GET',
      url: `/api/app/traceability-record/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getFieldByStepAndRecordByProcessStepIdAndTraceabilityRecordId = (processStepId: string, traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ProcessFieldDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/field-by-step-and-record',
      params: { processStepId, traceabilityRecordId },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TraceabilityRecordDto>>({
      method: 'GET',
      url: '/api/app/traceability-record',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListDone = (filter: TraceabilityRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TraceabilityRecordDoneDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/done',
      params: { companyProfileId: filter.companyProfileId, processId: filter.processId, fromDate: filter.fromDate, toDate: filter.toDate, status: filter.status, skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter },
    },
    { apiName: this.apiName,...config });
  

  getListReceived = (filter: TraceabilityRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TraceabilityRecordReceivedDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/received',
      params: { companyProfileId: filter.companyProfileId, processId: filter.processId, fromDate: filter.fromDate, toDate: filter.toDate, status: filter.status, skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter },
    },
    { apiName: this.apiName,...config });
  

  getListRecording = (filter: TraceabilityRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TraceabilityRecordingDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/recording',
      params: { companyProfileId: filter.companyProfileId, processId: filter.processId, fromDate: filter.fromDate, toDate: filter.toDate, status: filter.status, skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter },
    },
    { apiName: this.apiName,...config });
  

  getListShare = (filter: TraceabilityRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TraceabilityRecordShareDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/share',
      params: { companyProfileId: filter.companyProfileId, processId: filter.processId, fromDate: filter.fromDate, toDate: filter.toDate, status: filter.status, skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter },
    },
    { apiName: this.apiName,...config });
  

  getReception = (processStepId: string, traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<RecordReceptionDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/reception',
      params: { processStepId, traceabilityRecordId },
    },
    { apiName: this.apiName,...config });
  

  getReceptionDropdown = (processStepId: string, traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/reception-dropdown',
      params: { processStepId, traceabilityRecordId },
    },
    { apiName: this.apiName,...config });
  

  getRecordShared = (processStepId: string, traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<RecordReceptionDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/record-shared',
      params: { processStepId, traceabilityRecordId },
    },
    { apiName: this.apiName,...config });
  

  getRecordWasShared = (traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<TraceabilityRecordShareDto>>({
      method: 'GET',
      url: `/api/app/traceability-record/record-was-shared/${traceabilityRecordId}`,
    },
    { apiName: this.apiName,...config });
  

  getReportCompanyByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyReportDto>({
      method: 'GET',
      url: '/api/app/traceability-record/report-company',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportDiaryByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiaryReportDto>({
      method: 'GET',
      url: '/api/app/traceability-record/report-diary',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportMapInfoByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<MapInfoReport>>({
      method: 'GET',
      url: '/api/app/traceability-record/report-map-info',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportProductByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductReportDto>({
      method: 'GET',
      url: '/api/app/traceability-record/report-product',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getStepDropdown = (processId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/traceability-record/step-dropdown/${processId}`,
    },
    { apiName: this.apiName,...config });
  

  getStepResponseByTraceRecordIdAndProcessStepIdAndEntityValue = (traceRecordId: string, processStepId: string, entityValue: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ProcessFieldResponseDto>>({
      method: 'GET',
      url: '/api/app/traceability-record/step-response',
      params: { traceRecordId, processStepId, entityValue },
    },
    { apiName: this.apiName,...config });
  

  saveReception = (input: CreateUpdateRecordReceptionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RecordReceptionDto>({
      method: 'POST',
      url: '/api/app/traceability-record/save-reception',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveRecordResponse = (input: CreateUpdateRecordResponseDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/traceability-record/save-record-response',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  saveRecordShareByInput = (input: CreateUpdateRecordShareDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TraceabilityRecordShareDto>({
      method: 'POST',
      url: '/api/app/traceability-record/save-record-share',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  setDone = (traceabilityRecordId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: `/api/app/traceability-record/set-done/${traceabilityRecordId}`,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateTraceabilityRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TraceabilityRecordDto>({
      method: 'PUT',
      url: `/api/app/traceability-record/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
