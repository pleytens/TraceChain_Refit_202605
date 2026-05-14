import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import {
  StepReportDoneDto,
  StepReportDoneFilterDto,
  StepReportReceivedDto,
  type StepReportShareFilterDto,
  TraceabilityRecordV2Service,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { FormBuilder } from '@angular/forms';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners';
import { ChangeDetectorRef } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { LocalizationService } from '@abp/ng.core';
@Component({
  selector: 'app-recording',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [ListService],
})
export class SharedComponent implements OnInit {
  fromDate: string;
  toDate: string;
  filterText: string = null;
  isCollapsed = true;
  productData: any = {};
  customerData: any = {};
  recordShared = { items: [], totalCount: 0 } as PagedResultDto<StepReportReceivedDto>;
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };

  multiCustomerSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Customer'),
  };
  multiProductSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Product'),
  };

  constructor(
    public readonly list: ListService,
    private recordServiceV2: TraceabilityRecordV2Service,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private customerService: PartnerService,
    private localizationService: LocalizationService,
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getCustomerData();
    this.getProductData();
    const receptacleStreamCreator = query => {
      const filterModel = {} as StepReportShareFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.customerData.selected) {
        filterModel.partnerIds = this.customerData.selected;
      }
      if (this.productData.selected) {
        filterModel.productIds = this.productData.selected;
      }
      if (this.fromDate) {
        filterModel.creationDateStart = this.convertDate(this.fromDate);
      }
      if (this.toDate) {
        filterModel.creationDateEnd = this.convertDate(this.toDate);
      }
      return this.recordServiceV2.getStepRecordShared(filterModel);
    };
    this.list.hookToQuery(receptacleStreamCreator).subscribe(response => {
      this.recordShared = response;
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

  getProductData() {
    this.productData.data = [];
    this.productService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  getCustomerData() {
    this.customerData.data = [];
    this.customerService.getPartnerDropdown().subscribe(res => {
      this.customerData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  convertDate(date: any) {
    let month = date.month.toString().padStart(2, '0');
    let day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  printQrCodeFile(recordId: string) {
    const fullUrl = window.location.origin;
    this.recordServiceV2.getExcelFile(recordId, fullUrl).subscribe((res: any) => {
      let uri =
        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + res.data;
      let downloadLink = document.createElement('a');
      downloadLink.href = uri;
      downloadLink.download = res.fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }
}
