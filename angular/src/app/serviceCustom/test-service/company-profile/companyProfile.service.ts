import type { ProfileDto, ProfileFilterDto, CreateUpdateProfileDto, DropdownItemBaseDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { ListResultDto } from '@abp/ng.core';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiName = 'Default';
  

  create = (input: CreateUpdateProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProfileDto>({
      method: 'POST',
      url: '/api/app/company',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/company/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProfileDto>({
      method: 'GET',
      url: `/api/app/company/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProfileDto>>({
      method: 'GET',
      url: '/api/app/company',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (filter: ProfileFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProfileDto>>({
      method: 'GET',
      url: '/api/app/company/custom',
      params: {  marketId: filter.marketId, categoryId: filter.categoryId, skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProfileDto>({
      method: 'PUT',
      url: `/api/app/company/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });


    getMarketName = ( config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/company/market`,
    },
    { apiName: this.apiName,...config });

    getCategoryName = ( config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/company/category`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
