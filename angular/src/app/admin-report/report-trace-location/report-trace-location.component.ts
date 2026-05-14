import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { ProcessStepDto } from '@proxy/traceverified/trace-farm/process-managements';
import { DeviceDetectorService } from '../../shared/services/device-detector.service';
import {
  ProductScanDto,
  ReportScanTraceCodeService,
  type UserInteractionFilterDto,
} from '@proxy/traceverified/trace-farm/user-interactions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-trace-location',
  templateUrl: './report-trace-location.component.html',
  styleUrls: ['./report-trace-location.component.scss'],
  providers: [ListService],
})
export class ReportTraceLocationComponent implements OnInit {
  filterText: string = null;
  productReportScan = { items: [], totalCount: 0 } as PagedResultDto<ProductScanDto>;
  step = { items: [], totalCount: 0 } as PagedResultDto<ProcessStepDto>;
  selectedProductId: string;
  constructor(
    public readonly list: ListService,
    protected toasterService: ToasterService,
    private reportScanTraceCodeService: ReportScanTraceCodeService,
    private router: Router,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    this.getReportScanTraceCode();
  }

  getReportScanTraceCode() {
    const reportScanTraceCodeCreator = query => {
      const filterPayload: UserInteractionFilterDto = {
        filter: this.filterText,
        maxResultCount: query.maxResultCount,
        skipCount: 0,
        sorting: '',
      };
      return this.reportScanTraceCodeService.getProduct(filterPayload);
    };

    this.list.hookToQuery(reportScanTraceCodeCreator).subscribe({
      next: res => {
        this.productReportScan = res;
      },
    });
  }

  onProductSelect($event: any) {
    if ($event.type == 'click' && $event.row.productId) {
      this.selectedProductId = $event.row.productId;
    }
  }

  filter($event: any) {
    this.list.get();
  }

  viewInMap(id) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/admin-report/map-location'], {
        queryParams: {
          productId: id,
        },
      }),
    );
    window.open(url, '_blank');
  }
}
