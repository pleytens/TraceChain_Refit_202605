import type { CreateUpdateFieldOptionDto, ProcessFieldDto, ProcessFieldFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { EnumItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class ProcessFieldService {
  apiName = 'Default';
  

  create = (input: CreateUpdateFieldOptionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessFieldDto>({
      method: 'POST',
      url: '/api/app/process-field',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/process-field/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessFieldDto>({
      method: 'GET',
      url: `/api/app/process-field/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getFieldDataType = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<EnumItemBaseDto>>({
      method: 'GET',
      url: '/api/app/process-field/field-data-type',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessFieldDto>>({
      method: 'GET',
      url: '/api/app/process-field',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: ProcessFieldFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessFieldDto>>({
      method: 'GET',
      url: '/api/app/process-field/custom',
      params: { processStepId: input.processStepId },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateFieldOptionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessFieldDto>({
      method: 'PUT',
      url: `/api/app/process-field/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateList = (inputs: CreateUpdateFieldOptionDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, CreateUpdateFieldOptionDto[]>({
      method: 'PUT',
      url: '/api/app/process-field/list',
      body: inputs,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
