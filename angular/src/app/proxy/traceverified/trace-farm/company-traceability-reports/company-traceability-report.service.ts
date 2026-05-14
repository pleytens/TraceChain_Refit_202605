import type { CompanyTraceabilityReportDto, CompanyTraceabilityReportFilter } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DropdownItemBaseDto } from '../share/models';

@Injectable({
  providedIn: 'root',
})
export class CompanyTraceabilityReportService {
  apiName = 'Default';
  

  getCompanyDropdown = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DropdownItemBaseDto>>({
      method: 'GET',
      url: '/api/app/company-traceability-report/company-dropdown',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: CompanyTraceabilityReportFilter, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CompanyTraceabilityReportDto>>({
      method: 'GET',
      url: '/api/app/company-traceability-report',
      params: { companyId: input.companyId, fromDate: input.fromDate, toDate: input.toDate, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
