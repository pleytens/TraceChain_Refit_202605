import { Component, inject, Input, OnInit } from '@angular/core';
import { LocalizationModule } from '@abp/ng.core';
import { QuillViewComponent } from 'ngx-quill';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { CompanyReportDto } from '@proxy/traceverified/trace-farm/traceability-records/reports';
import { ListCertComponent } from '../share/list-cert/list-cert.component';
import { QrCodeType } from '../../shared/common/constant.variable.model';

@Component({
  selector: 'app-company-report',
  standalone: true,
  imports: [LocalizationModule, QuillViewComponent, NgbCollapse, ListCertComponent],
  templateUrl: './company-report.component.html',
  styleUrls: ['./company-report.component.scss'],
})
export class CompanyReportComponent implements OnInit {
  @Input() traceCode: string = '';
  @Input() gtin: string = '';
  @Input() qrType: number = QrCodeType.QrCodeDefault;
  @Input() isCustomReport: boolean = false;
  companyModel: CompanyReportDto;
  private traceabilityReportService = inject(ReportService);
  constructor() {}

  ngOnInit() {
    if (this.qrType === QrCodeType.QrCodeDefault) {
      if (this.traceCode) {
        this.getCompanyReportService(this.traceCode);
      } else if (this.gtin) {
        this.getCompanyByGtin(this.gtin);
      }
    } else {
      if (this.gtin) {
        this.getCompanyForFree(this.gtin);
      }
    }
  }

  getCompanyReportService(traceCode: string) {
    this.traceabilityReportService.getReportCompanyByTraceCode(traceCode).subscribe({
      next: res => {
        this.companyModel = res;
      },
    });
  }

  getCompanyByGtin(gtin: string) {
    this.traceabilityReportService.getReportCompanyForProductByGtinCodeAndLotId(gtin).subscribe({
      next: res => {
        this.companyModel = res;
      },
    });
  }

  getCompanyForFree(gtin: string) {
    this.traceabilityReportService.getReportCompanyForFreeByGtinCode(gtin).subscribe({
      next: res => {
        this.companyModel = res;
      },
    });
  }
}
