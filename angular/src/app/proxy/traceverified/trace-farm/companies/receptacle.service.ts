import type { CreateUpdateReceptacleDto, ReceptacleDto, ReceptacleFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class ReceptacleService {
  apiName = 'Default';
  

  create = (input: CreateUpdateReceptacleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReceptacleDto>({
      method: 'POST',
      url: '/api/app/receptacle',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/receptacle/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReceptacleDto>({
      method: 'GET',
      url: `/api/app/receptacle/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ReceptacleDto>>({
      method: 'GET',
      url: '/api/app/receptacle',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: ReceptacleFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ReceptacleDto>>({
      method: 'GET',
      url: '/api/app/receptacle/custom',
      params: { code: input.code, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getReceptacleDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/receptacle/receptacle-dropdown',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateReceptacleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReceptacleDto>({
      method: 'PUT',
      url: `/api/app/receptacle/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
