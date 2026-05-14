import type { CreateUpdateReceptacleDto, ReceptacleDto, ReceptacleFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class ReceptacleService {
    apiName = 'Default';

    create = (input: CreateUpdateReceptacleDto, config?: Partial<Rest.Config>) =>
      this.restService.request<any, ReceptacleDto>(
        {
          method: 'POST',
          url: '/api/identity/users',
          body: input,
        },
        { apiName: this.apiName, ...config }
      );
  
    delete = (id: string, config?: Partial<Rest.Config>) =>
      this.restService.request<any, void>(
        {
          method: 'DELETE',
          url: `/api/identity/users/${id}`,
        },
        { apiName: this.apiName, ...config }
      );
  
    get = (id: string, config?: Partial<Rest.Config>) =>
      this.restService.request<any, ReceptacleDto>(
        {
          method: 'GET',
          url: `/api/identity/users/${id}`,
        },
        { apiName: this.apiName, ...config }
      );
  
    getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
      this.restService.request<any, PagedResultDto<ReceptacleDto>>(
        {
          method: 'GET',
          url: '/api/identity/users',
          params: {
            sorting: input.sorting,
            skipCount: input.skipCount,
            maxResultCount: input.maxResultCount,
          },
        },
        { apiName: this.apiName, ...config }
      );
  
    getListCustom = (filter: ReceptacleFilterDto, config?: Partial<Rest.Config>) =>
      this.restService.request<any, PagedResultDto<ReceptacleDto>>(
        {
          method: 'GET',
          url: '/api/identity/users',
          params: {
            skipCount: filter.skipCount,
            maxResultCount: filter.maxResultCount,
            sorting: filter.sorting,
            filter: filter.filter,
          },
        },
        { apiName: this.apiName, ...config }
      );
  
    update = (id: string, input: CreateUpdateReceptacleDto, config?: Partial<Rest.Config>) =>
      this.restService.request<any, ReceptacleDto>(
        {
          method: 'PUT',
          url: `/api/identity/users/${id}`,
          body: input,
        },
        { apiName: this.apiName, ...config }
      );
  
    constructor(private restService: RestService) {}
}