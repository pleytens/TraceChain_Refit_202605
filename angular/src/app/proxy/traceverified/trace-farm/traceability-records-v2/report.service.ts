import type { CompanyCardInfoDto, DiaryReportV2Dto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { CompanyReportDto, MapInfoReportV2, ProductReportDto, ProductReportForExportDto } from '../traceability-records/reports/models';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  apiName = 'Default';
  

  getNumberOfCompaniesJoinByYear = (year: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, number[]>({
      method: 'GET',
      url: '/api/app/report/number-of-companies-join',
      params: { year },
    },
    { apiName: this.apiName,...config });
  

  getReportCompanyByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyReportDto>({
      method: 'GET',
      url: '/api/app/report/report-company',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportCompanyForFreeByGtinCode = (gtinCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyReportDto>({
      method: 'GET',
      url: '/api/app/report/report-company-for-free',
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  getReportCompanyForProductByGtinCodeAndLotId = (gtinCode: string, lotId?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyReportDto>({
      method: 'GET',
      url: `/api/app/report/report-company-for-product/${lotId}`,
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  getReportCompanyInfoByTraceCodeAndUserType = (traceCode: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<CompanyCardInfoDto>>({
      method: 'GET',
      url: '/api/app/report/report-company-info',
      params: { traceCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportDiaryByGtinCodeAndLotIdAndUserType = (gtinCode: string, lotId?: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiaryReportV2Dto>({
      method: 'GET',
      url: `/api/app/report/report-diary/${lotId}`,
      params: { gtinCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportDiaryByTraceCodeAndUserType = (traceCode: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiaryReportV2Dto>({
      method: 'GET',
      url: '/api/app/report/report-diary',
      params: { traceCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportDiaryByTraceabilityCodeByTraceCodeAndUserType = (traceCode: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiaryReportV2Dto>({
      method: 'GET',
      url: '/api/app/report/report-diary-by-traceability-code',
      params: { traceCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportMapInfoByTraceCodeAndUserType = (traceCode: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<MapInfoReportV2>>({
      method: 'GET',
      url: '/api/app/report/report-map-info',
      params: { traceCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportMapInfoForProductByLotIdAndGtinCodeAndUserType = (lotId: string, gtinCode: string, userType: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<MapInfoReportV2>>({
      method: 'GET',
      url: `/api/app/report/report-map-info-for-product/${lotId}`,
      params: { gtinCode, userType },
    },
    { apiName: this.apiName,...config });
  

  getReportProductByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductReportDto>({
      method: 'GET',
      url: '/api/app/report/report-product',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportProductForExportByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductReportForExportDto>({
      method: 'GET',
      url: '/api/app/report/report-product-for-export',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });
  

  getReportProductForFreeByGtinCode = (gtinCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductReportDto>({
      method: 'GET',
      url: '/api/app/report/report-product-for-free',
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  getReportProductForProByGtinCodeAndLotId = (gtinCode: string, lotId?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductReportDto>({
      method: 'GET',
      url: `/api/app/report/report-product-for-pro/${lotId}`,
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  showUserTypeByTraceCode = (traceCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/report/show-user-type',
      params: { traceCode },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
