import type { ProcessDetailDto, ProcessFilterDto, ProcessMobileDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProcessMobileService {
  apiName = 'Default';
  

  getListStepInProcess = (processId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ProcessDetailDto>>({
      method: 'GET',
      url: `/api/app/process-mobile/step-in-process/${processId}`,
    },
    { apiName: this.apiName,...config });
  

  postListCustom = (input: ProcessFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessMobileDto>>({
      method: 'POST',
      url: '/api/app/process-mobile/list-custom',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
