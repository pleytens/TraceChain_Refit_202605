import { Component, OnInit } from '@angular/core';
import {
  CodeSharedFilterDto,
  type CodeSharedPerCusFilterDto,
  DashboardService
} from '@proxy/traceverified/trace-farm/dashboards';
import { AuthService, LocalizationService } from '@abp/ng.core';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';

@Component({
  selector: 'app-report-qr-code-share-per-customer',
  templateUrl: './report-qr-code-share-per-customer.component.html',
  styleUrls: ['./report-qr-code-share-per-customer.component.scss']
})

export class ReportQrCodeSharePerCustomerComponent implements OnInit {
  from: any;
  to: any;
  partnerData: any = {};
  productData: any = {};
  options = {
    plugins: {
      title: {
        display: false,
      },
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false, // Determines whether the grid lines are shown
          color: "rgba(255, 0, 0, 0.1)", // Grid line color
          drawBorder: true, // Determines whether the border is drawn
          drawOnChartArea: true, // Determines whether grid lines are drawn on the chart area
          drawTicks: true, // Determines whether ticks are drawn on the scale
        }
      },
      y: {
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
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 text-start',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 flex-fill ',
    dynamicTitleMaxItems: 3,
  };
  multiSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Record:Product'),
  };
  data = {};
  constructor(private dashboardService: DashboardService,
              private authService: AuthService,
              private productService: ProductService,
              private partnerService: PartnerService,
              private localizationService: LocalizationService) {}
  ngOnInit() {
    if (!this.authService.isAuthenticated){
      this.authService.navigateToLogin();
    }
    this.getPartnerData();
    this.getProductData();
    this.getFromAndToDate();
    this.getData();
  }
  getData(){
    const input = {
      fromDate: this.from,
      toDate: this.to,
      customerId: this.partnerData.partnerId,
      productIds: this.productData.productId
    } as CodeSharedPerCusFilterDto;
    this.dashboardService.postQrCodeSharedPerCus(input).subscribe((res) => {
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

  getProductData() {
    this.productData.data = [];
    this.productService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
    });
  }

  eventProductSelectHandle($event: any) {
    if ($event.success) {
      this.productData.productId = [$event.data.id];
      this.getData();
    } else {
      this.productData.productId = null;
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

  onChangeDate(event: any) {
    this.getData();
  }
  refresh() {
    this.partnerData.partnerId = "";
    this.productData.productId = null;
    this.productData.selected = {};
    this.partnerData.selected = {};
    this.getFromAndToDate();
    this.getData();
  }
}
