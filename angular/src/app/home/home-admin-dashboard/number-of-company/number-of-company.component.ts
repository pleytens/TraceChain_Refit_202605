import { Component, OnInit } from '@angular/core';
import { ChartModule } from '@abp/ng.components/chart.js';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import {  LocalizationService } from '@abp/ng.core';

@Component({
  selector: 'app-chart-demo',
  standalone: true,
  imports: [
    ChartModule
  ],
  templateUrl: './number-of-company.component.html',
  styleUrls: ['./number-of-company.component.scss']
})
export class ChartDemoComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  companyNumberData: any
  config = {
    type: 'bar',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 30
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#FFFFFF',
            padding: 30,
            font: {
              size: 14,
              family: 'Arial'
            }
          }

        },
        y: {
          beginAtZero: true,
          grid: {
            display: false ,
            drawBorder: false
          },
          ticks: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: this.localizationService.instant('::Home:NumberOfCompany') ,
          color: '#FFFFFF', // Change font color of y-axis title
          font: {
            size: 16, // Font size for y-axis title
            family: 'Arial' // Font family for y-axis title
          },
          align: 'start'
        }
      }
    }
  };
  data = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    datasets: [
      {
        label: 'Number of company',
        backgroundColor: '#fff',
        data: [],
        barThickness: 15,
        borderRadius: 30,
        minBarLength: 1,
        borderSkipped: false
      }
    ]
  };
  constructor(private reportService: ReportService,     private localizationService: LocalizationService
  ) {
  }
  ngOnInit() {
    this.getNumberOfCompany(this.currentYear)
  }

  getNumberOfCompany(currentYear: number) {
    this.reportService.getNumberOfCompaniesJoinByYear(currentYear).subscribe((res) => {
      this.data.datasets[0].data = res;
    })
  }
}
