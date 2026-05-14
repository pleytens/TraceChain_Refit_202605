import type { CreateUpdateStampDto, StampDto, StampExportResponseDto, StampFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { StartAndEndGenerateDto } from '../traceability-records-v2/models';

@Injectable({
  providedIn: 'root',
})
export class StampService {
  apiName = 'Default';
  

  create = (input: CreateUpdateStampDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StampDto>({
      method: 'POST',
      url: '/api/app/stamp',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/stamp/${id}`,
    },
    { apiName: this.apiName,...config });
  

  generateStampNumber = (numberOfStamps: number, companyId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StartAndEndGenerateDto>({
      method: 'POST',
      url: `/api/app/stamp/generate-stamp-number/${companyId}`,
      params: { numberOfStamps },
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StampDto>({
      method: 'GET',
      url: `/api/app/stamp/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getExcelFile = (stampId: string, clientUrl: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StampExportResponseDto>({
      method: 'GET',
      url: `/api/app/stamp/excel-file/${stampId}`,
      params: { clientUrl },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StampDto>>({
      method: 'GET',
      url: '/api/app/stamp',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (filter: StampFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StampDto>>({
      method: 'GET',
      url: '/api/app/stamp/custom',
      params: { skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter, companyIds: filter.companyIds, fromDate: filter.fromDate, toDate: filter.toDate },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateStampDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StampDto>({
      method: 'PUT',
      url: `/api/app/stamp/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
