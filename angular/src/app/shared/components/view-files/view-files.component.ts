import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FileInfoDto, StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { BaseCoreModule } from '@abp/ng.core';

@Component({
  selector: 'app-view-files',
  standalone: true,
  imports: [BaseCoreModule],
  templateUrl: './view-files.component.html',
  styleUrl: './view-files.component.scss',
})
export class ViewFilesComponent implements OnInit {
  @Input() isLoad: boolean = true;
  @Input() isEditable: boolean = true;
  @Input() fileIds: string;
  @Input() datatype: number = 6;
  @Output() eventDeleteFileEmit = new EventEmitter<any>();
  fileUrls: FileInfoDto[];

  private storageService = inject(StorageService);

  ngOnInit() {
    if (this.fileIds) {
      this.getFilesById();
    }
  }

  getFilesById() {
    if (!this.isLoad) return;
    this.storageService.getFilesById(this.fileIds).subscribe(files => {
      this.fileUrls = files;
    });
  }

  getFileIconClass(fileName: string, field: any): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'pdf':
        // Icon cho PDF
        return 'far fa-file-pdf file-icon pdf-icon';
      case 'doc':
      case 'docx':
        // Icon cho Word
        return 'far fa-file-word file-icon doc-icon';
      default:
        // Icon mặc định cho các loại file khác (nếu có)
        return 'far fa-file file-icon default-icon';
    }
  }

  deleteDocumentFile(field: any, index: number): void {
    const removed = field.splice(index, 1)[0];
    this.eventDeleteFileEmit.emit(removed.fileId);
    URL.revokeObjectURL(removed.url);
  }
  openFileUrl(url: string): void {
    if (url) {
      // Dùng window.open() để mở URL trong một tab/cửa sổ mới
      window.open(url, '_blank');
    }
  }
}
