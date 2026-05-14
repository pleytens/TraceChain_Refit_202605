import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';

import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';

import { ProcessService } from '@proxy/traceverified/trace-farm/process-managements';

import {
  TraceabilityRecordV2Service,
  ProcessRecordFilterDto,
  ProcessRecordOutputDto,
  TraceabilityRecordMobileService,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import {
  IMultiSelectSettings,
  IMultiSelectOption,
  IMultiSelectTexts,
} from 'ngx-bootstrap-multiselect';
import { UserCustomService } from '@proxy/traceverified/trace-farm/account-managements';
import { LocalizationService } from '@abp/ng.core';

@Component({
  selector: 'app-record-v2',
  templateUrl: './record-v2.component.html',
  styleUrls: ['./record-v2.component.scss'],
  providers: [ListService],
})
export class RecordV2Component implements OnInit {
  @ViewChildren(TypeheadFocusComponent) typeheadFocusComponents: QueryList<TypeheadFocusComponent>;
  @Input() isShowHome = false;
  fromDate: any;
  toDate: any;
  createByFilter: string[];
  filterText: string = null;
  isShowFilter = true;
  process = { items: [], totalCount: 0 } as PagedResultDto<ProcessRecordOutputDto>;
  isCollapsed = true;
  processData: any = {};
  userData: any = {};
  filterProcess: string[];
  processOptions: IMultiSelectOption[];
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };

  multiSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Record:SelectProcess'),
  };
  multiCreatedBySelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Record:CreatedBy'),
  };
  filterDateChange() {
    this.list.get();
  }

  constructor(
    private processService: ProcessService,
    private recordServiceV2: TraceabilityRecordV2Service,
    private traceabilityRecordV2Service: TraceabilityRecordMobileService,
    public readonly list: ListService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private customUserService: UserCustomService,
    private localizationService: LocalizationService,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    if (this.isShowHome) {
      this.isShowFilter = false;
    }

    this.getProcessData();
    this.getUserData();
    const processStreamCreator = query => {
      const filterModel = {} as ProcessRecordFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = this.isShowHome ? 5 : query.maxResultCount;
      if (this.filterProcess) {
        filterModel.processIds = this.filterProcess;
      }
      if (this.createByFilter) {
        filterModel.createdBy = this.createByFilter;
      }

      if (this.toDate) {
        const date = this.toDate;
        filterModel.creationDateEnd = date.year + '-' + date.month + '-' + date.day;
      }

      if (this.fromDate) {
        const date = this.fromDate;
        filterModel.creationDateStart = date.year + '-' + date.month + '-' + date.day;
      }

      return this.recordServiceV2.getProcessRecord(filterModel);
    };
    this.list.hookToQuery(processStreamCreator).subscribe(response => {
      this.process = response;
    });
  }

  filter($event: any) {
    this.list.get();
  }

  getProcessData() {
    this.processData.data = [];
    this.processService.getDropdownList().subscribe(res => {
      this.processData.data = res;
      this.processOptions = this.processData?.data?.items;
      this.cdRef.detectChanges();
    });
  }

  getUserData() {
    this.userData.data = [];
    this.customUserService.getUserDropdownItemByFilter(null).subscribe(res => {
      this.userData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  recording(processId: string): void {
    this.router.navigate(['/recordV2/recording', { id: processId }]);
  }

  rowClick($event: any) {
    if ($event.type == 'click') {
      this.recording($event.row.processId);
    }
  }
}
