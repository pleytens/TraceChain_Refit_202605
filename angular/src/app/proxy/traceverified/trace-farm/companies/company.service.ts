import type { CompanyDto, CompanyFilterDto, CreateUpdateCompanyDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  apiName = 'Default';
  

  create = (input: CreateUpdateCompanyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyDto>({
      method: 'POST',
      url: '/api/app/company',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  createNotCreateTenant = (input: CreateUpdateCompanyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyDto>({
      method: 'POST',
      url: '/api/app/company/not-create-tenant',
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
    this.restService.request<any, CompanyDto>({
      method: 'GET',
      url: `/api/app/company/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getByTenant = (tenantId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyDto>({
      method: 'GET',
      url: `/api/app/company/by-tenant/${tenantId}`,
    },
    { apiName: this.apiName,...config });
  

  getCompanyDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/company/company-dropdown',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CompanyDto>>({
      method: 'GET',
      url: '/api/app/company',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: CompanyFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CompanyDto>>({
      method: 'GET',
      url: '/api/app/company/custom',
      params: { provinceId: input.provinceId, districtId: input.districtId, wardId: input.wardId, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateCompanyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyDto>({
      method: 'PUT',
      url: `/api/app/company/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateByAdmin = (id: string, input: CreateUpdateCompanyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyDto>({
      method: 'PUT',
      url: `/api/app/company/${id}/by-admin`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
