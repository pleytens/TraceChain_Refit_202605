import type { CreateUpdateMarketDto, MarketDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto, RequestCustomDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  apiName = 'Default';
  

  create = (input: CreateUpdateMarketDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MarketDto>({
      method: 'POST',
      url: '/api/app/market',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/market/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MarketDto>({
      method: 'GET',
      url: `/api/app/market/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MarketDto>>({
      method: 'GET',
      url: '/api/app/market',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: RequestCustomDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MarketDto>>({
      method: 'GET',
      url: '/api/app/market/custom',
      params: { skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getMarketDefault = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, MarketDto>({
      method: 'GET',
      url: '/api/app/market/market-default',
    },
    { apiName: this.apiName,...config });
  

  getMarketDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/market/market-dropdown',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateMarketDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MarketDto>({
      method: 'PUT',
      url: `/api/app/market/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
