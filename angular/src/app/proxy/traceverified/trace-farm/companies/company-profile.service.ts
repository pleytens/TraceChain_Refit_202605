import type { CompanyProfileDto, CompanyProfileFilterDto, CreateUpdateCompanyProfileDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  apiName = 'Default';
  

  create = (input: CreateUpdateCompanyProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyProfileDto>({
      method: 'POST',
      url: '/api/app/company-profile',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  createForGenQrCode = (input: CreateUpdateCompanyProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyProfileDto>({
      method: 'POST',
      url: '/api/app/company-profile/for-gen-qr-code',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/company-profile/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyProfileDto>({
      method: 'GET',
      url: `/api/app/company-profile/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getDropdownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/company-profile/dropdown-list',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CompanyProfileDto>>({
      method: 'GET',
      url: '/api/app/company-profile',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: CompanyProfileFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CompanyProfileDto>>({
      method: 'GET',
      url: '/api/app/company-profile/custom',
      params: { marketId: input.marketId, productCategoryId: input.productCategoryId, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateCompanyProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyProfileDto>({
      method: 'PUT',
      url: `/api/app/company-profile/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
