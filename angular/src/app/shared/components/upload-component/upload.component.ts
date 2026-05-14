import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FileUploadService } from '../../services/file-upload.service';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';

interface UploadResponse {
  images: string[];
  deleteImages: number[];
}

@Component({
  selector: 'app-upload-component',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnChanges {
  @Input() maxFilesNumber: number;
  @Input() imageName: string;
  imgSrc: { src: string; id: number }[] = [];
  private deletedImageIds: number[] = [];
  private filesForUpload: File[] = [];

  private storageService = inject(StorageService);
  private uploadService = inject(FileUploadService);

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageName'] && changes['imageName'].currentValue) {
      this.getImageUrl(this.imageName);
    }
  }

  getImageUrl(imageName: string) {
    if (imageName) {
      this.storageService.getFileUrlByFileName(imageName).subscribe({
        next: res => {
          this.imgSrc.push({
            src: res,
            id: null,
          });
        },
      });
    }
  }

  deleteImage(image: { src: string; id: number }) {
    if (image.id !== -1) {
      this.deletedImageIds.push(image.id);
    } else {
      const index = this.imgSrc.findIndex(img => img.src === image.src && img.id === -1);
      if (index !== -1) {
        this.filesForUpload.splice(index, 1);
      }
    }
    this.imgSrc = this.imgSrc.filter(img => img !== image);
  }

  imageSelectHandle($event: any) {
    const files: File[] = Array.from($event.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.imgSrc.push({
          src: e.target!.result as string,
          id: -1,
        });
      };
      reader.readAsDataURL(file);
      this.filesForUpload.push(file);
    });
    $event.target.value = '';
  }

  async submit(): Promise<UploadResponse> {
    if (!this.filesForUpload || this.filesForUpload.length === 0) {
      return {
        deleteImages: this.deletedImageIds,
        images: [],
      };
    }

    const uploadedFile: string[] = await Promise.all(
      this.filesForUpload.map(image => this.uploadService.uploadFile(image)),
    );

    return {
      images: uploadedFile,
      deleteImages: this.deletedImageIds,
    };
  }

  async submitSingle(): Promise<string> {
    if (!this.filesForUpload || this.filesForUpload.length === 0) {
      return;
    }

    return await this.uploadService.uploadFile(this.filesForUpload[0]);
  }
}
