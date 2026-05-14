import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { IActionResult } from '../../../microsoft/asp-net-core/mvc/models';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationTokenService {
  apiName = 'Default';
  

  confirmTokenByToken = (token: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>({
      method: 'GET',
      url: '/api/app/confirmation-token',
      params: { token },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
