import type { CreateUpdateEnumTranslationDto, EnumTranslationDto, EnumTranslationFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { EnumItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class EnumTranslationService {
  apiName = 'Default';
  

  create = (input: CreateUpdateEnumTranslationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EnumTranslationDto>({
      method: 'POST',
      url: '/api/app/enum-translation',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/enum-translation/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EnumTranslationDto>({
      method: 'GET',
      url: `/api/app/enum-translation/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<EnumTranslationDto>>({
      method: 'GET',
      url: '/api/app/enum-translation',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: EnumTranslationFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<EnumItemBaseDto>>({
      method: 'GET',
      url: '/api/app/enum-translation/custom',
      params: { enumType: input.enumType },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateEnumTranslationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EnumTranslationDto>({
      method: 'PUT',
      url: `/api/app/enum-translation/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
