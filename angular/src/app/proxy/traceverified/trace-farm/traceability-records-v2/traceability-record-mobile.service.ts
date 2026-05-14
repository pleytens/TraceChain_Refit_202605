import type { ProcessRecordFilterDto, ProcessRecordOutputDto, StepRecordDropdownFilterDto, StepReportDto, StepReportFilterDto, StepReportReceivedDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemForMobileDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class TraceabilityRecordMobileService {
  apiName = 'Default';
  

  getRecordByCode = (input: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StepReportReceivedDto>({
      method: 'GET',
      url: '/api/app/traceability-record-mobile/record-by-code',
      params: { input },
    },
    { apiName: this.apiName,...config });
  

  postFirstStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'POST',
      url: '/api/app/traceability-record-mobile/first-step-report',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  postLastStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'POST',
      url: '/api/app/traceability-record-mobile/last-step-report',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  postNormalStepReport = (input: StepReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StepReportDto>>({
      method: 'POST',
      url: '/api/app/traceability-record-mobile/normal-step-report',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  postProcessRecord = (input: ProcessRecordFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessRecordOutputDto>>({
      method: 'POST',
      url: '/api/app/traceability-record-mobile/process-record',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  postStepRecordDropdown = (input: StepRecordDropdownFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemForMobileDto>>({
      method: 'POST',
      url: '/api/app/traceability-record-mobile/step-record-dropdown',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
