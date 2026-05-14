import type { CreateUpdateReportTemplateDto, ReportTemplateDto, ReportTemplateFilterDto, StepAndFieldDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { EnumItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class ReportTemplateService {
  apiName = 'Default';
  

  create = (input: CreateUpdateReportTemplateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReportTemplateDto>({
      method: 'POST',
      url: '/api/app/report-template',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/report-template/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReportTemplateDto>({
      method: 'GET',
      url: `/api/app/report-template/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ReportTemplateDto>>({
      method: 'GET',
      url: '/api/app/report-template',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: ReportTemplateFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ReportTemplateDto>>({
      method: 'GET',
      url: '/api/app/report-template/custom',
      params: { name: input.name, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getStepAndFieldByReportTemplateIdAndProcessId = (reportTemplateId: string, processId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<StepAndFieldDto>>({
      method: 'GET',
      url: '/api/app/report-template/step-and-field',
      params: { reportTemplateId, processId },
    },
    { apiName: this.apiName,...config });
  

  getUserTypeDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<EnumItemBaseDto>>({
      method: 'GET',
      url: '/api/app/report-template/user-type-dropdown',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateReportTemplateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReportTemplateDto>({
      method: 'PUT',
      url: `/api/app/report-template/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
