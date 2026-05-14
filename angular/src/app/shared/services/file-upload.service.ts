import { ToasterService } from '@abp/ng.theme.shared';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  constructor(
    private storageService: StorageService,
    private toasterService: ToasterService,
  ) {}

  uploadFile(file: File): Promise<string> {
    if (!this.validateFile(file)) {
      return Promise.reject('Invalid file');
    }

    const fileType = file.name.split('.').pop();
    const fileName = this.generateUniqueFileName(fileType);
    const formData = new FormData();
    formData.append('file', file, fileName);

    return new Promise<string>((resolve, reject) => {
      this.storageService.uploadFileByFile(formData).subscribe({
        next: (response: string) => resolve(response),
        error: error => reject(error),
      });
    });
  }

  validateFile(file: File): boolean {
    if (!file) {
      this.toasterService.error('::InvalidFile', '::InvalidFile');
      return false;
    }
    if (!this.allowedTypes.includes(file.type)) {
      this.toasterService.error('::FileType', '::FileType');
      return false;
    }
    if (file.size > this.maxFileSize) {
      this.toasterService.error('::MaxFileSize', '::MaxFileSize');
      return false;
    }
    return true;
  }

  generateUniqueFileName(fileType: string): string {
    const uniqueId = uuidv4().replace(/-/g, '');
    return `${uniqueId}.${fileType}`;
  }
}
