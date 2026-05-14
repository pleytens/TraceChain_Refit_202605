import type { CreateUpdatePartnerDto, PartnerDto, PartnerFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  apiName = 'Default';
  

  create = (input: CreateUpdatePartnerDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PartnerDto>({
      method: 'POST',
      url: '/api/app/partner',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/partner/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PartnerDto>({
      method: 'GET',
      url: `/api/app/partner/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCompanyInfo = (gs1Code: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PartnerDto>({
      method: 'GET',
      url: '/api/app/partner/company-info',
      params: { gs1Code },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<PartnerDto>>({
      method: 'GET',
      url: '/api/app/partner',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: PartnerFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<PartnerDto>>({
      method: 'GET',
      url: '/api/app/partner/custom',
      params: { provinceId: input.provinceId, districtId: input.districtId, wardId: input.wardId, nationId: input.nationId, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getPartnerDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/partner/partner-dropdown',
    },
    { apiName: this.apiName,...config });
  

  getSupplierDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/partner/supplier-dropdown',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdatePartnerDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PartnerDto>({
      method: 'PUT',
      url: `/api/app/partner/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
