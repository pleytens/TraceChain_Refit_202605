import { Component, OnInit } from '@angular/core';
import { DashboardService } from '@proxy/traceverified/trace-farm/dashboards';

@Component({
  selector: 'app-top-right',
  templateUrl: './top-right.component.html',
  styleUrls: ['./top-right.component.scss']
})
export class TopRightComponent implements OnInit{
  numberOfData:any = [];

  constructor(private dashboardService:DashboardService) {
  }
  ngOnInit() {
    this.getStatistical();
  }
  getStatistical() {
    this.dashboardService.getStatistical().subscribe((res) => {
      this.numberOfData = res.items;
    });
  }
}
