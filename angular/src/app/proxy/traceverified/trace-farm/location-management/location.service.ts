import type { LocationMasterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  apiName = 'Default';
  

  getAllLocation = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<LocationMasterDto>>({
      method: 'GET',
      url: '/api/app/location/location',
    },
    { apiName: this.apiName,...config });
  

  getCountryDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/location/country-dropdown',
    },
    { apiName: this.apiName,...config });
  

  getDistrictDropdown = (provinceId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/location/district-dropdown/${provinceId}`,
    },
    { apiName: this.apiName,...config });
  

  getProvinceDropdown = (countryId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/location/province-dropdown/${countryId}`,
    },
    { apiName: this.apiName,...config });
  

  getWardDropdown = (districtId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: `/api/app/location/ward-dropdown/${districtId}`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
