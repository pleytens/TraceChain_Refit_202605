import { Component, OnInit } from '@angular/core';
import { ListService, LocalizationService, PagedResultDto } from '@abp/ng.core';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import {
  CompanyProfileDto,
  CompanyProfileFilterDto,
  CompanyProfileService
} from '@proxy/traceverified/trace-farm/companies';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { CompanyReportTv2Dto, DashboardService, type ProductInfoDto } from '@proxy/traceverified/trace-farm/dashboards';
import { Status } from '../../shared/common/constant.variable.model';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';

@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],

})
export class ProductDashboardComponent implements  OnInit {
  product = [] as ProductInfoDto[];
  fromDate: any;
  toDate: any;
  status = { data: [], selected: null };
  isExtendTimeModalOpen = false;
  extendTimeModel = {
    newExpiredDate: new Date(),
    gtinCode: '',
    id: ''
  }

  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };
  multiProductSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Status'),
  };


  constructor(
    public readonly list: ListService,
    private productService: ProductService,
    private localizationService: LocalizationService,
    private dashboardService: DashboardService,
  ){}

  ngOnInit() {
    this.getProductInfo()
    this.getStatusDropdown()

  }

  filterDateChange() {
    this.getProductInfo();
  }

  getProductInfo() {
    const filterModel = {
      fromDate: '',
      toDate: '',
      isExpired: this.status.selected,
      quantityToTake: 10
    }
    if (this.fromDate){
      filterModel.fromDate = this.fromDate.toISOString();
    } else filterModel.fromDate = '';
    if (this.toDate){
      filterModel.toDate = this.toDate.toISOString();
    } else filterModel.toDate = '';

    this.dashboardService.getProductsByInput(filterModel).subscribe(
      {
        next: (res) => {
          this.product = res;
        }
      }
    )
  }

  viewTraceability(viewTraceabilityUrl: any) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/p?d=' + viewTraceabilityUrl + '&QrType=2';
    window.open(fullLink, '_blank');
  }

  getStatusDropdown() {
    this.status = { data: [], selected: '' };
    this.status.data = Object.keys(Status)
      .filter(key => isNaN(Number(key)))
      .map(key => ({ id: Status[key as keyof typeof Status], name: key }));
  }

  eventStatusSelectHandle($event) {
    if ($event.data.id === Status.Active) {
      this.status.selected = false
    } else if ($event.data.id === Status.Expired) {
      this.status.selected = true
    } else {
      this.status.selected = null
    }
    this.getProductInfo()
  }

  showExtendTimeModel(gtinCode: any, creationTime: any, id: any) {
    this.isExtendTimeModalOpen = true;
    this.extendTimeModel.gtinCode = gtinCode;
    this.extendTimeModel.id = id;
    let expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 90);
    this.extendTimeModel.newExpiredDate = expiredDate;
  }

  extendActiveTime() {
    this.productService.extendActiveTimeByProductIdAndExpirationTime(this.extendTimeModel.id,
      this.extendTimeModel.newExpiredDate.toISOString()).subscribe(
      {
        next: (res) => {
          this.getProductInfo();
          this.isExtendTimeModalOpen = false;
        }
      }
    );
  }
}
