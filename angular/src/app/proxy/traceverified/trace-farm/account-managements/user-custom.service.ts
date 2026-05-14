import type { UserCreateDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';
import type { IdentityUserDto } from '../../../volo/abp/identity/models';

@Injectable({
  providedIn: 'root',
})
export class UserCustomService {
  apiName = 'Default';
  

  create = (input: UserCreateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IdentityUserDto>({
      method: 'POST',
      url: '/api/app/user-custom',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/user-custom/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IdentityUserDto>({
      method: 'GET',
      url: `/api/app/user-custom/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<IdentityUserDto>>({
      method: 'GET',
      url: '/api/app/user-custom',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getUserAvatarByUserId = (userId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'GET',
      responseType: 'text',
      url: `/api/app/user-custom/user-avatar/${userId}`,
    },
    { apiName: this.apiName,...config });
  

  getUserDropdownItem2ByFilter = (filter: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/user-custom/user-dropdown-item2',
      params: { filter },
    },
    { apiName: this.apiName,...config });
  

  getUserDropdownItemByFilter = (filter: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/user-custom/user-dropdown-item',
      params: { filter },
    },
    { apiName: this.apiName,...config });
  

  getUserProfileByUserId = (userId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserCreateDto>({
      method: 'GET',
      url: `/api/app/user-custom/user-profile/${userId}`,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: UserCreateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IdentityUserDto>({
      method: 'PUT',
      url: `/api/app/user-custom/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateAvatar = (userId: string, fileName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'PUT',
      responseType: 'text',
      url: `/api/app/user-custom/avatar/${userId}`,
      params: { fileName },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
