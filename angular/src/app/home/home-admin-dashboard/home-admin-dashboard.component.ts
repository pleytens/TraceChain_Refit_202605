import { AuthService, ConfigStateService,SessionStateService } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '@proxy/traceverified/trace-farm/dashboards';

@Component({
  selector: 'app-home-admin-dashboard',
  templateUrl: './home-admin-dashboard.component.html',
  styleUrls: ['./home-admin-dashboard.component.scss']
})
export class HomeAdminDashboardComponent  implements OnInit{
  companyProfit: any
  get hasLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }
  constructor(private authService: AuthService, private sessionState: SessionStateService, private dashboardService: DashboardService) { }
  ngOnInit() {
    if (!this.hasLoggedIn) {
      this.login()
    } else {
      this.getCompanyStatus()
    }
  }
  login() {
    this.authService.navigateToLogin();
  }

  getCompanyStatus() {
    this.dashboardService.getCompanyStatus().subscribe((res) => {
      this.companyProfit = res
    })
  }
}
