import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ListCertComponent } from '../share/list-cert/list-cert.component';
import { LocalizationModule } from '@abp/ng.core';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { QuillViewComponent } from 'ngx-quill';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { QrCodeType } from '../../shared/common/constant.variable.model';
import { ProductReportDto } from '@proxy/traceverified/trace-farm/traceability-records/reports';
import { DomSanitizer } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-product-report',
  standalone: true,
  imports: [
    ListCertComponent,
    LocalizationModule,
    NgbCollapse,
    QuillViewComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './product-report.component.html',
  styleUrls: ['./product-report.component.scss'],
})
export class ProductReportComponent implements OnInit {
  @Input() traceCode: string = '';
  @Input() userType: number;
  @Input() gtin: string = '';
  @Input() qrType: number = QrCodeType.QrCodeDefault;
  @Input() isCustomReport: boolean = false;
  @Output() productNameEmit = new EventEmitter<string>();
  @Output() productCodeEmit = new EventEmitter<string>();
  productModel: ProductReportDto;
  carouselItems = [];

  private reportService = inject(ReportService);
  private sanitizer = inject(DomSanitizer);

  constructor() {}

  ngOnInit() {
    if (this.qrType === QrCodeType.QrCodeDefault) {
      if (this.traceCode) {
        this.getProductInfo(this.traceCode);
      } else if (this.gtin) {
        this.getProductInfoByGtin(this.gtin);
      }
    } else {
      if (this.gtin) {
        this.getProductForFree(this.gtin);
      }
    }
  }

  initCarouselItem() {
    this.productModel?.videoUrls?.forEach(video => {
      if (video) {
        const videoId = this.extractVideoId(video);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&showinfo=0`
        );
        this.carouselItems.push({ type: 'video', src: safeUrl });
      }
    });
    this.productModel?.images?.forEach(img => {
      if (img) {
        this.carouselItems.push({ type: 'image', src: img });
      }
    });
  }

  private extractVideoId(url: string): string {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : url;
  }

  getProductInfo(traceCode: string) {
    this.reportService.getReportProductByTraceCode(traceCode).subscribe({
      next: res => {
        this.productModel = res;
        this.productNameEmit.emit(res.productName);
        this.productCodeEmit.emit(res.productId);
        this.initCarouselItem();
      },
    });
  }

  getProductInfoByGtin(gtin: string) {
    this.reportService.getReportProductForProByGtinCodeAndLotId(gtin).subscribe({
      next: res => {
        this.productModel = res;
        this.productNameEmit.emit(res.productName);
        this.initCarouselItem();
      },
    });
  }

  getProductForFree(gtin: string) {
    this.reportService.getReportProductForFreeByGtinCode(gtin).subscribe({
      next: res => {
        this.productModel = res;
        this.productNameEmit.emit(res.productName);
        this.initCarouselItem();
      },
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
  openFileUrl(url: string): void {
    if (url) {
      // Dùng window.open() để mở URL trong một tab/cửa sổ mới
      window.open(url, '_blank');
    }
  }
}
