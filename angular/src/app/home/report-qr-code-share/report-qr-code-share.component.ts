import { Component, OnInit } from '@angular/core';
import { CodeSharedFilterDto, DashboardService } from '@proxy/traceverified/trace-farm/dashboards';
import { ChartModule } from '@abp/ng.components/chart.js';
import { AuthService, CoreModule } from '@abp/ng.core';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners';

@Component({
  selector: 'app-report-qr-code-share',
  templateUrl: './report-qr-code-share.component.html',
  standalone: true,
  imports: [
    ChartModule,
    CoreModule,
    TypeheadFocusComponent
  ],
  styleUrls: ['./report-qr-code-share.component.scss']
})
export class ReportQrCodeShareComponent implements OnInit{
  from: any;
  to: any;
  partnerData: any = {};
  data = {};
  options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 17 // Sets the font size for legend labels
          }
        }
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart - Stacked'
      },
    },
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false, // Determines whether the grid lines are shown
          color: "rgba(255, 0, 0, 0.1)", // Grid line color
          drawBorder: true, // Determines whether the border is drawn
          drawOnChartArea: true, // Determines whether grid lines are drawn on the chart area
          drawTicks: true, // Determines whether ticks are drawn on the scale
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false, // Determines whether the grid lines are shown
          color: "rgba(255, 0, 0, 0.1)", // Grid line color
          drawBorder: true, // Determines whether the border is drawn
          drawOnChartArea: true, // Determines whether grid lines are drawn on the chart area
          drawTicks: true, // Determines whether ticks are drawn on the scale
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService,
              private authService: AuthService,
              private partnerService: PartnerService) {
  }
  ngOnInit(): void {
    if (!this.authService.isAuthenticated){
      this.authService.navigateToLogin();
    }
    this.getPartnerData();
    this.getFromAndToDate();
    this.getData();
  }
  getData(){
    const input = {
      fromDate: this.from,
      toDate: this.to,
      processId: this.partnerData.partnerId
    } as CodeSharedFilterDto;

    this.dashboardService.postQrCodeShared(input).subscribe((res) => {
      this.data = res;
    });
  }
  getPartnerData() {
    this.partnerData.data = [];
    this.partnerService.getPartnerDropdown().subscribe(res => {
      this.partnerData.data = res.items;
    });
  }

  eventPartnerSelectHandle($event: any) {
    if ($event.success) {
      this.partnerData.partnerId = $event.data.id;
      this.getData();
    } else {
      this.partnerData.partnerId = null;
    }
  }
  getFromAndToDate(){
    // Get current date
    let currentDate = new Date();
    this.to = currentDate.toISOString().split('T')[0];
    // Get date 30 days before
    this.from = new Date();
    this.from.setDate(currentDate.getDate() - 30);
    this.from = this.from.toISOString().split('T')[0];
  }

  onChangeDate($event: Event) {
    this.getData();
  }

  refresh() {
    this.partnerData.partnerId = null;
    this.getFromAndToDate();
    this.getData();
  }
}
