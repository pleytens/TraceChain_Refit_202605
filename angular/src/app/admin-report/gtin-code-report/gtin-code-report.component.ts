import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import {
  GtinCodeReportDto,
  GtinCodeReportFilterDto,
  ReportScanTraceCodeService,
} from '@proxy/traceverified/trace-farm/user-interactions';
import { BaseCoreModule, ListService, LocalizationModule, PagedResultDto } from '@abp/ng.core';
import { NgbDropdownModule, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gtin-code-report',
  standalone: true,
  imports: [
    BaseThemeSharedModule,
    LocalizationModule,
    NgbDropdownModule,
    DatePipe,
    BaseCoreModule,
    NgbInputDatepicker,
  ],
  templateUrl: './gtin-code-report.component.html',
  styleUrl: './gtin-code-report.component.scss',
})
export class GtinCodeReportComponent implements OnInit, OnChanges {
  @Input() productId: string;
  gtinCodeReportModel: PagedResultDto<GtinCodeReportDto>;

  filterModel = {
    filterText: '',
    fromDate: {} as NgbDateStruct,
    toDate: {} as NgbDateStruct,
  };
  constructor(
    public readonly listService: ListService,
    private reportScanTraceCodeService: ReportScanTraceCodeService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.productId) {
      this.getGtinCodeReport();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productId'].currentValue) {
      this.getGtinCodeReport();
    }
  }

  getGtinCodeReport() {
    const gtinCodeReportStreamCreator = query => {
      const filterPayload: GtinCodeReportFilterDto = {
        sorting: query.sorting,
        skipCount: query.skipCount,
        maxResultCount: query.maxResultCount,
        filter: this.filterModel.filterText,
        fromDate: this.ngbDateStructToIsoString(this.filterModel.fromDate),
        toDate: this.ngbDateStructToIsoString(this.filterModel.toDate),
        productId: this.productId,
      };

      return this.reportScanTraceCodeService.getGtinCodeReport(filterPayload);
    };

    this.listService.hookToQuery(gtinCodeReportStreamCreator).subscribe({
      next: res => {
        this.gtinCodeReportModel = res;
      },
    });
  }

  ngbDateStructToIsoString(date: NgbDateStruct | null): string {
    if (
      !date ||
      typeof date.year !== 'number' ||
      typeof date.month !== 'number' ||
      typeof date.day !== 'number'
    ) {
      return '';
    }
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return jsDate.toISOString();
  }

  filter() {
    this.getGtinCodeReport();
  }

  viewReport(traceCode: string) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/t'], { queryParams: { d: traceCode } }),
    );
    window.open(url, '_blank');
  }
  viewInMap(id) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/admin-report/map-location'], {
        queryParams: {
          traceabilityCode: id,
        },
      }),
    );
    window.open(url, '_blank');
  }
}
