import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmailingService {
  apiName = 'Default';
  

  sendEmailToConfirm = (email: string, companyName: string, url: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/emailing/send-email-to-confirm',
      params: { email, companyName, url },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
