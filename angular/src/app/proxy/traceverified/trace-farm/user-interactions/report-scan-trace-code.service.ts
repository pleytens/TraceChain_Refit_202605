import type { GtinCodeReportDto, GtinCodeReportFilterDto, LatLongReportDto, ProductScanDto, UserInteractionFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReportScanTraceCodeService {
  apiName = 'Default';
  

  getGtinCodeReport = (input: GtinCodeReportFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<GtinCodeReportDto>>({
      method: 'GET',
      url: '/api/app/report-scan-trace-code/gtin-code-report',
      params: { fromDate: input.fromDate, toDate: input.toDate, productId: input.productId, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  getLatLongInMapByProductIdByProductId = (productId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, LatLongReportDto[]>({
      method: 'GET',
      url: `/api/app/report-scan-trace-code/lat-long-in-map-by-product-id/${productId}`,
    },
    { apiName: this.apiName,...config });
  

  getLatLongInMapByTraceabilityCodeByTraceabilityCode = (traceabilityCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, LatLongReportDto[]>({
      method: 'GET',
      url: '/api/app/report-scan-trace-code/lat-long-in-map-by-traceability-code',
      params: { traceabilityCode },
    },
    { apiName: this.apiName,...config });
  

  getProduct = (input: UserInteractionFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProductScanDto>>({
      method: 'GET',
      url: '/api/app/report-scan-trace-code/product',
      params: { skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
