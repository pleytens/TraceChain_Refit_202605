import type { FileInfoDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  apiName = 'Default';
  

  downloadFileByFileName = (fileName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: '/api/app/storage/download-file',
      params: { fileName },
    },
    { apiName: this.apiName,...config });
  

  getBase64ImageByFileName = (fileName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'GET',
      responseType: 'text',
      url: '/api/app/storage/base64Image',
      params: { fileName },
    },
    { apiName: this.apiName,...config });
  

  getFileUrlByFileName = (fileName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'GET',
      responseType: 'text',
      url: '/api/app/storage/file-url',
      params: { fileName },
    },
    { apiName: this.apiName,...config });
  

  getFilesById = (input: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FileInfoDto[]>({
      method: 'GET',
      url: '/api/app/storage/files-by-id',
      params: { input },
    },
    { apiName: this.apiName,...config });
  

  getFilesByName = (input: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FileInfoDto[]>({
      method: 'GET',
      url: '/api/app/storage/files-by-name',
      params: { input },
    },
    { apiName: this.apiName,...config });
  

  getListImageBase64 = (relatedEntityType: number, relatedEntityId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'GET',
      url: `/api/app/storage/image-base64/${relatedEntityId}`,
      params: { relatedEntityType },
    },
    { apiName: this.apiName,...config });
  

  getListImageUrl = (relatedEntityType: number, relatedEntityId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'GET',
      url: `/api/app/storage/image-url/${relatedEntityId}`,
      params: { relatedEntityType },
    },
    { apiName: this.apiName,...config });
  

  uploadFileByFile = (file: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/storage/upload-file',
      body: file,
    },
    { apiName: this.apiName,...config });
  

  uploadFileWithSaveByFile = (file: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/storage/upload-file-with-save',
      body: file,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
