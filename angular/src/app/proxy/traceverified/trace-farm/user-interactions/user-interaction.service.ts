import type { ViewCountDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserInteractionService {
  apiName = 'Default';
  

  getViewByObjectByObjectTypeAndObjectId = (objectType: number, objectId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, number>({
      method: 'GET',
      url: `/api/app/user-interaction/view-by-object/${objectId}`,
      params: { objectType },
    },
    { apiName: this.apiName,...config });
  

  viewCounterByInput = (input: ViewCountDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/user-interaction/view-counter',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
