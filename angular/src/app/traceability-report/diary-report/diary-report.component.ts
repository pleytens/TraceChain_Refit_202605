import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import {
  DiaryReportStepV2Dto,
  ReportService,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { CommonModule } from '@angular/common';
import { CarouselMapService } from '../share/carousel-navigate.service';
import { ViewFilesComponent } from 'src/app/shared/components/view-files/view-files.component';
import { LocalizationModule } from '@abp/ng.core';

@Component({
  selector: 'app-diary-report',
  standalone: true,
  imports: [TimelineModule, CommonModule, ViewFilesComponent, LocalizationModule],
  templateUrl: './diary-report.component.html',
  styleUrl: './diary-report.component.scss',
})
export class DiaryReportComponent implements OnInit, OnChanges {
  @Input() traceCode: string;
  @Input() userType: number;
  @Input() isCustomReport: boolean = false;
  @Input() gtin: string;
  @Input() lotId: string;
  event: DiaryReportStepV2Dto[];

  reportService = inject(ReportService);
  carouselService = inject(CarouselMapService);

  ngOnInit() {
    if (this.traceCode) {
      this.getReportDiary();

      this.carouselService.traceCode$.subscribe((key: string) => {
        if (key === 'none') {
          this.event = [];
          return;
        }
        if (key) {
          this.getDiaryByTraceCode(key);
        } else {
          this.getReportDiary();
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lotId'].currentValue) {
      this.getDiaryByGtin(this.gtin, this.lotId);
    }
  }

  private getReportDiary() {
    this.reportService
      .getReportDiaryByTraceCodeAndUserType(this.traceCode, this.userType)
      .subscribe(async res => {
        this.event = res.steps;
      });
  }

  getDiaryByTraceCode(traceCode: string) {
    this.reportService.getReportDiaryByTraceabilityCodeByTraceCodeAndUserType(traceCode).subscribe({
      next: result => {
        this.event = result.steps;
      },
    });
  }

  getDiaryByGtin(gtin: string, lotId: string) {
    this.reportService
      .getReportDiaryByGtinCodeAndLotIdAndUserType(gtin, lotId, this.userType)
      .subscribe({
        next: res => {
          this.event = res.steps;
        },
      });
  }

  getDomainName(code: any) {
    if (code && code !== '#') {
      const fullUrl = window.location.origin;
      window.location.href = fullUrl + '/t?d=' + code;
    }
  }

  convertDate(value: string): string {
    // strict match: 4 digits - 2 digits - 2 digits
    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;

    if (!regex.test(value)) {
      return value; // not in YYYY-MM-DD format
    }

    const [y, m, d] = value.split('-');
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');

    return `${dd}-${mm}-${y}`;
  }
}
