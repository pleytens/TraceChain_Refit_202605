import type { CreateUpdateUserDto, UserDto, UserFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { PagedAndSortedResultRequestDto, PagedResultDto, ListResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type {  IdentityRoleDto, IdentityUserUpdateRolesDto } from './models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiName = 'Default';
  create = (input: CreateUpdateUserDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDto>({
      method: 'POST',
      url: '/api/identity/users',
      body: input,
    },
    { apiName: this.apiName,...config });


  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/identity/users/${id}`,
    },
    { apiName: this.apiName,...config });


  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDto>({
      method: 'GET',
      url: `/api/identity/users/${id}`,
    },
    { apiName: this.apiName,...config });

    getUserData = ( config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDto>({
      method: 'GET',
      url: `/api/identity/users/`,
    },
    { apiName: this.apiName,...config });


  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<UserDto>>({
      method: 'GET',
      url: '/api/identity/users',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });


  getListCustom = (filter: UserFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<UserDto>>({
      method: 'GET',
      url: '/api/identity/users',
      params: { skipCount: filter.skipCount, maxResultCount: filter.maxResultCount, sorting: filter.sorting, filter: filter.filter,  fromDate: filter.fromDate, toDate: filter.toDate,  nationID: filter.nationId, provinceID: filter.provinceId, districtId: filter.districtId, wardId: filter.wardId},
    },
    { apiName: this.apiName,...config });


  update = (id: string, input: CreateUpdateUserDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDto>({
      method: 'PUT',
      url: `/api/identity/users/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });



    getRoles = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<IdentityRoleDto>>({
      method: 'GET',
      url: `/api/identity/users/${id}/roles`,
      params: {},
    },
    { apiName: this.apiName,...config });
    getAssignableRoles = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<IdentityRoleDto>>({
      method: 'GET',
      url: '/api/identity/roles',
      params: {},
    },
    { apiName: this.apiName,...config });

    updateRoles: (id: string, input: IdentityUserUpdateRolesDto) => import("rxjs").Observable<void>;

  constructor(private restService: RestService) {}
}

