import { SessionStateService } from '@abp/ng.core';
import { Component } from '@angular/core';
import { DashboardService } from '@proxy/traceverified/trace-farm/dashboards';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  companyProfit: any;

  constructor(
    private sessionState: SessionStateService,
    private dashboardService: DashboardService
  ) {
    this.getCompanyStatus();
  }

  get tenantName(): boolean {
    let tenantName = false;
    this.sessionState.getTenant$().subscribe(tenant => {
      if (tenant && tenant.name != null) {
        tenantName = true;
      }
    });
    return tenantName;
  }

  calculateWidth(achieved: number, total: number): string {
    return (achieved / total) * 100 + '%';
  }

  goToRecord() {
    const fullUrl = window.location.origin;
    window.location.href = fullUrl + '/recordV2';
  }

  getCompanyStatus() {
    this.dashboardService.getCompanyStatus().subscribe(res => {
      this.companyProfit = res;
    });
  }
}
