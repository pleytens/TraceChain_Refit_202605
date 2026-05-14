import type { CreateUpdateProcessDto, ProcessDto, ProcessFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  apiName = 'Default';
  

  create = (input: CreateUpdateProcessDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessDto>({
      method: 'POST',
      url: '/api/app/process',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/process/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessDto>({
      method: 'GET',
      url: `/api/app/process/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getDropdownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/process/dropdown-list',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessDto>>({
      method: 'GET',
      url: '/api/app/process',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: ProcessFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessDto>>({
      method: 'GET',
      url: '/api/app/process/custom',
      params: { skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateProcessDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessDto>({
      method: 'PUT',
      url: `/api/app/process/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
