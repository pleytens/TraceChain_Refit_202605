import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { CompanyReportTv2Dto, DashboardService } from '@proxy/traceverified/trace-farm/dashboards';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],

})
export class CompanyDashboardComponent implements OnInit {
  company = [] as CompanyReportTv2Dto[];

  constructor(
    public readonly list: ListService,
    private dashboardService: DashboardService,
    private storageService: StorageService,
  ) {
  }

  ngOnInit() {
    this.getCompanyInfo()
  }

  getCompanyInfo() {
    this.dashboardService.getCompanyUsingSystem().subscribe(
      {
        next: (res) => {
          this.company = res;
        }
      }
    )
  }

}
