import type { CodeSharedFilterDto, CodeSharedPerCusFilterDto, CompanyReportTv2Dto, CompanyStatusDto, ProductFilterDto, ProductInfoDto, StatisticalDto, StatisticalQrCodeSharedDto, StatisticalQrCodeSharedPerCusDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  apiName = 'Default';
  

  getCompanyStatus = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyStatusDto>({
      method: 'GET',
      url: '/api/app/dashboard/company-status',
    },
    { apiName: this.apiName,...config });
  

  getCompanyUsingSystem = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyReportTv2Dto[]>({
      method: 'GET',
      url: '/api/app/dashboard/company-using-system',
    },
    { apiName: this.apiName,...config });
  

  getProductsByInput = (input: ProductFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductInfoDto[]>({
      method: 'GET',
      url: '/api/app/dashboard/products',
      params: { fromDate: input.fromDate, toDate: input.toDate, isExpired: input.isExpired, quantityToTake: input.quantityToTake },
    },
    { apiName: this.apiName,...config });
  

  getStatistical = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<StatisticalDto>>({
      method: 'GET',
      url: '/api/app/dashboard/statistical',
    },
    { apiName: this.apiName,...config });
  

  postQrCodeShared = (input: CodeSharedFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StatisticalQrCodeSharedDto>({
      method: 'POST',
      url: '/api/app/dashboard/qr-code-shared',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  postQrCodeSharedPerCus = (input: CodeSharedPerCusFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StatisticalQrCodeSharedPerCusDto>({
      method: 'POST',
      url: '/api/app/dashboard/qr-code-shared-per-cus',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
