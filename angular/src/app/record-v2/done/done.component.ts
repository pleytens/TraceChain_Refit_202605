import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import {
  StepReportDoneDto,
  StepReportDoneFilterDto,
  TraceabilityRecordV2Service,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { share } from 'rxjs';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { CompanyProfileService } from '@proxy/traceverified/trace-farm/companies';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { LocalizationService } from '@abp/ng.core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-recording',
  templateUrl: './done.component.html',
  styleUrls: ['./done.component.scss'],
  providers: [ListService],
})
export class DoneComponent implements OnInit {
  fromDate: any;
  toDate: any;
  filterText: string = null;
  isCollapsed = true;
  productData: any = {};
  profileData: any = {};
  recordDone = { items: [], totalCount: 0 } as PagedResultDto<StepReportDoneDto>;

  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };

  multiProfileSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Profile'),
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
    private productService: ProductService,
    private profileService: CompanyProfileService,
    private localizationService: LocalizationService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getProductData();
    this.getProfileData();
    const receptacleStreamCreator = query => {
      const filterModel = {} as StepReportDoneFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.productData.selected) {
        filterModel.productIds = this.productData.selected;
      }
      if (this.profileData.selected) {
        filterModel.profileIds = this.profileData.selected;
      }
      if (this.fromDate) {
        const dateString = this.fromDate.year + '-' + this.fromDate.month + '-' + this.fromDate.day;

        filterModel.creationDateStart = dateString;
      }
      if (this.toDate) {
        const dateString = this.toDate.year + '-' + this.toDate.month + '-' + this.toDate.day;
        filterModel.creationDateEnd = dateString;
      }
      return this.recordServiceV2.getStepRecordDone(filterModel);
    };
    this.list.hookToQuery(receptacleStreamCreator).subscribe(response => {
      this.recordDone = response;
    });
  }

  filter($event: any) {
    this.list.get();
  }

  filterDateChange() {
    this.list.get();
  }

  eventProfileFilterSelectHandle($event) {
    if ($event.success) {
      this.profileData.selected = $event.data.id;
      this.list.get();
    } else {
      this.profileData.selected = null;
      this.list.get();
    }
  }
  eventProductFilterSelectHandle($event) {
    if ($event.success) {
      this.productData.selected = $event.data.id;
      this.list.get();
    } else {
      this.productData.selected = null;
      this.list.get();
    }
  }

  protected readonly share = share;

  back(id) {
    this.recordServiceV2.setStepRecordingByRecordShare(id).subscribe(res => {
      if (res) {
        this.toaster.success('::Record:Recording:Success');
        this.list.get();
      }
    });
  }

  shareToPartner(id) {}

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

  getProfileData() {
    this.profileData.data = [];
    this.profileService.getDropdownList().subscribe(res => {
      this.profileData.data = res.items;
      this.cdRef.detectChanges();
    });
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
