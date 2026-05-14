import type { CompanyForQrCodeDto, GenerateQrCodeDto, GenerateQrCodeResponseDto, UpdateCompanyInfoDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GenerateQrCodeService {
  apiName = 'Default';
  

  checkEmailCompanyByEmailInput = (emailInput: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/generate-qr-code/check-email-company',
      params: { emailInput },
    },
    { apiName: this.apiName,...config });
  

  checkGtinCodeByGtinCode = (gtinCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/generate-qr-code/check-gtin-code',
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  createQrCode = (input: GenerateQrCodeDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, GenerateQrCodeResponseDto>({
      method: 'POST',
      url: '/api/app/generate-qr-code/qr-code',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  getCompanyByGs1Code = (gs1Code: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CompanyForQrCodeDto>({
      method: 'GET',
      url: '/api/app/generate-qr-code/company-by-gs1Code',
      params: { gs1Code },
    },
    { apiName: this.apiName,...config });
  

  getQrCodeInformationByToken = (inputToken: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, GenerateQrCodeResponseDto>({
      method: 'GET',
      url: '/api/app/generate-qr-code/qr-code-information-by-token',
      params: { inputToken },
    },
    { apiName: this.apiName,...config });
  

  updateCompanyEmailByInput = (input: UpdateCompanyInfoDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'PUT',
      url: '/api/app/generate-qr-code/company-email',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
