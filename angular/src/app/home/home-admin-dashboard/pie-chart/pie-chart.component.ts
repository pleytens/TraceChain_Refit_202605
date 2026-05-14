import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from '@abp/ng.components/chart.js';
import { DashboardService } from '@proxy/traceverified/trace-farm/dashboards';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [
    ChartModule
  ],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  @Input() dataPie: any;
  data = {
    labels: [
      'Not Registered',
      'Joined Company',

    ],
    datasets: [{
      label: 'My First Dataset',
      data: [],
      backgroundColor: [
        '#10228B',
        '#098B5D',
      ],
      hoverOffset: 4
    }]
  };

  config = {
    data: this.data,
    options: {
      cutout: 10,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.data.datasets[0].data = this.dataPie;
  }

  getCompanyStatus(){
    this.dashboardService.getCompanyStatus().subscribe((res) => {
      this.data.datasets[0].data = res.companyStatuses;
    })
  }
}
