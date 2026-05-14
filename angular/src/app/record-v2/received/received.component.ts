import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import {
  StepReportReceivedDto,
  StepReportShareFilterDto,
  TraceabilityRecordV2Service,
  StepReportDoneDto,
  StepReportDoneFilterDto,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { SupplierService } from '@proxy/traceverified/trace-farm/supplier-managements';
import { ChangeDetectorRef } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { LocalizationService } from '@abp/ng.core';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners';

@Component({
  selector: 'app-recording',
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.scss'],
  providers: [ListService],
})
export class ReceivedComponent implements OnInit {
  fromDate: any;
  toDate: any;
  filterText: string = null;
  isCollapsed = true;
  productData: any = {};
  supplierData: any = {};
  recordReceived = { items: [], totalCount: 0 } as PagedResultDto<StepReportReceivedDto>;
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };

  multiSupplierSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Supplier'),
  };
  multiProductSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Product'),
  };

  constructor(
    public readonly list: ListService,
    private recordServiceV2: TraceabilityRecordV2Service,
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private localizationService: LocalizationService,
    private partnerService: PartnerService,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getProductData();
    this.getSupplierData();
    const receptacleStreamCreator = query => {
      const filterModel = {} as StepReportShareFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.fromDate) {
        filterModel.creationDateStart = this.convertDate(this.fromDate);
      }
      if (this.toDate) {
        filterModel.creationDateEnd = this.convertDate(this.toDate);
      }
      if (this.productData.selected) {
        filterModel.productIds = this.productData.selected;
      }
      if (this.supplierData.selected) {
        filterModel.partnerIds = this.supplierData.selected;
      }
      return this.recordServiceV2.getStepRecordReceived(filterModel);
    };
    this.list.hookToQuery(receptacleStreamCreator).subscribe(response => {
      this.recordReceived = response;
    });
    this.productService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
    });
  }

  filter($event: any) {
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

  convertDate(date: any) {
    let month = date.month.toString().padStart(2, '0');
    let day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  getProductData() {
    this.productData.data = [];
    this.productService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  getSupplierData() {
    this.supplierData.data = [];
    this.partnerService.getSupplierDropdown().subscribe(res => {
      this.supplierData.data = res.items;
      this.cdRef.detectChanges();
    });
  }
}
