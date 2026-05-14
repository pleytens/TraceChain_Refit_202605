import type { CreateUpdateProcessStepDto, ProcessStepDto, ProcessStepFilterDto, UpdateStepPositionDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProcessStepService {
  apiName = 'Default';
  

  create = (input: CreateUpdateProcessStepDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessStepDto>({
      method: 'POST',
      url: '/api/app/process-step',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/process-step/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessStepDto>({
      method: 'GET',
      url: `/api/app/process-step/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessStepDto>>({
      method: 'GET',
      url: '/api/app/process-step',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: ProcessStepFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProcessStepDto>>({
      method: 'GET',
      url: '/api/app/process-step/custom',
      params: { processId: input.processId, skipCount: input.skipCount, maxResultCount: input.maxResultCount, sorting: input.sorting, filter: input.filter },
    },
    { apiName: this.apiName,...config });
  

  setFirstStep = (processId: string, stepId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/process-step/set-first-step',
      params: { processId, stepId },
    },
    { apiName: this.apiName,...config });
  

  setLastStep = (processId: string, stepId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/process-step/set-last-step',
      params: { processId, stepId },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateProcessStepDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProcessStepDto>({
      method: 'PUT',
      url: `/api/app/process-step/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateMultipleStep = (steps: UpdateStepPositionDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'PUT',
      url: '/api/app/process-step/multiple-step',
      body: steps,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
