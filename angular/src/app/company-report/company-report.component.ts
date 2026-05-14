import { Component, OnInit } from '@angular/core';
import { AuthService, ListService, PagedResultDto } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { ChangeDetectorRef } from '@angular/core';
import { LocalizationService } from '@abp/ng.core';
import {
  CompanyTraceabilityReportDto,
  CompanyTraceabilityReportFilter,
  CompanyTraceabilityReportService,
} from '@proxy/traceverified/trace-farm/company-traceability-reports';
import { CompanyProfileService } from '@proxy/traceverified/trace-farm/companies';

@Component({
  selector: 'app-company-report',
  templateUrl: './company-report.component.html',
  styleUrls: ['./company-report.component.scss'],
  providers: [ListService],
})
export class CompanyReportComponent implements OnInit {
  fromDate: string;
  toDate: string;
  filterText: string = null;
  isCollapsed = true;
  companyData: any = {};
  company = { items: [], totalCount: 0 } as PagedResultDto<CompanyTraceabilityReportDto>;

  constructor(
    public readonly list: ListService,
    private companyTraceabilityReport: CompanyTraceabilityReportService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.hasLoggedIn();
    this.getCompanyData();
    const companyStreamCreator = query => {
      const filterModel = {} as CompanyTraceabilityReportFilter;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.companyData.selected) {
        filterModel.companyId = this.companyData.selected;
      }
      if (this.fromDate) {
        filterModel.fromDate = this.convertDate(this.fromDate);
      }
      if (this.toDate) {
        filterModel.toDate = this.convertDate(this.toDate);
      }
      return this.companyTraceabilityReport.getList(filterModel);
    };
    this.list.hookToQuery(companyStreamCreator).subscribe(response => {
      this.company = response;
    });
  }
  hasLoggedIn() {
    if (!this.authService.isAuthenticated) {
      this.authService.navigateToLogin();
    }
  }

  filter() {
    this.list.get();
  }

  filterDateChange() {
    this.list.get();
  }

  viewTraceability(viewTraceabilityUrl: any) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/t?d=' + viewTraceabilityUrl;
    window.open(fullLink, '_blank');
  }

  getCompanyData() {
    this.companyData.data = [];
    this.companyTraceabilityReport.getCompanyDropdown().subscribe(res => {
      this.companyData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  convertDate(date: any) {
    let month = date.month.toString().padStart(2, '0');
    let day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  eventCompanyReportSelectHandle($event: any) {
    if ($event.success) {
      this.companyData.selected = $event.data.id;
      this.list.get();
    } else {
      this.companyData.selected = null;
      this.list.get();
    }
  }

  redirectUrl(redirectUrl: any) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/tv?d=' + redirectUrl;
    window.open(fullLink, '_blank');
  }
}
