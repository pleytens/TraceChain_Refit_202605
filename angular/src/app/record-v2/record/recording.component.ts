import { Component, OnInit, ViewChildren, QueryList, Inject, inject } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners/';
import { map, tap, catchError } from 'rxjs/operators';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { ProcessStepService } from '@proxy/traceverified/trace-farm/process-managements';
import { ActivatedRoute } from '@angular/router';
import {
  TraceabilityRecordV2Service,
  StepReportFilterDto,
  StepReportDto,
  CreateUpdateStepReportFirstDto,
  CreateUpdateStepReportNormalDto,
  CreateUpdateStepReportLastDto,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { ConfigStateService } from '@abp/ng.core';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { UserCustomService } from '@proxy/traceverified/trace-farm/account-managements';
import { firstValueFrom, lastValueFrom, Observable, of } from 'rxjs';
import { CompanyProfileService } from '@proxy/traceverified/trace-farm/companies';
import { ABP } from '@abp/ng.core';
import { LocalizationService } from '@abp/ng.core';
import { EnumTranslationService } from '@proxy/traceverified/trace-farm/enum-translations';
import { NgZone } from '@angular/core';

const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid
@Component({
  selector: 'app-recording',
  templateUrl: './recording.component.html',
  styleUrls: ['./recording.component.scss'],
  providers: [ListService],
})
export class RecordingComponent implements OnInit {
  //Inject service

  public readonly list = inject(ListService);
  private confirmation = inject(ConfirmationService);
  private locationService = inject(LocationService);
  private processStepService = inject(ProcessStepService);
  private fileService = inject(StorageService);
  private companyService = inject(CompanyProfileService);
  private partnerService = inject(PartnerService);
  private toaster = inject(ToasterService);
  private toastyService = inject(ToasterService);
  private route = inject(ActivatedRoute);
  private recordServiceV2 = inject(TraceabilityRecordV2Service);
  private config = inject(ConfigStateService);
  private productService = inject(ProductService);
  private userCustomService = inject(UserCustomService);
  private localizationService = inject(LocalizationService);
  private enumService = inject(EnumTranslationService);
  private ngZone = inject(NgZone);

  @ViewChildren(TypeheadFocusComponent) typeheadFocusComponents: QueryList<TypeheadFocusComponent>;
  record = { items: [], totalCount: 0 } as PagedResultDto<StepReportDto>;
  fromDate: any;
  toDate: any;
  filterText: string = null;
  userFilter: any = null;
  isFirstStepModalOpen = false;
  isNormalStepModalOpen = false;
  isLastStepModalOpen = false;
  isFirstStepViewModalOpen = false;
  isNormalStepViewModalOpen = false;
  isLastStepViewModalOpen = false;
  profileNameData: any = {};
  isCollapsed = true;
  selectedStep: any;
  fieldData: any = [];
  userData: any = {};
  stepData: any = [];
  lotDropDown: any = {};
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  receptionData: any = {};
  statusData: any = {};
  selectedReception: any = {};
  productData: any = {};
  partnerData: any = {};
  selectedlastStep: any = {};
  executorData: any = {};
  receptionDropdown: any = {};
  recordCodeDropdown = { data: [] };
  entityValue: any = {};
  processStepResponseId: string;
  recordShareData: any = {};
  normalStepRecordCode: any = {};
  statusFilter: any;
  processId: string;
  activeStepId: number = 1;
  saveRecordId: string = null;
  selectedOptionsMap: Map<string, any[]> = new Map<string, any[]>();
  currentUser = this.config.getOne('currentUser');
  isEditing: boolean;
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 text-start',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 flex-fill ',
    dynamicTitleMaxItems: 3,
  };
  multiSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Record:SelectRecordCode'),
  };
  images: any = [];
  documentFiles: any = [];
  deletedFileId = [];
  breadCrumbItems: ABP.Route[] = [
    {
      name: 'Item 1',
    },
    {
      name: 'Item 2',
      path: '/recordV2',
    },
  ];
  isSaving: boolean = false;

  constructor() {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      this.showStep(this.processId);
      this.getStatusData();
      this.getUserData();
    });
  }

  filter() {
    this.list.get();
  }
  filterDateChange() {
    this.list.get();
  }
  eventStatusFilterSelectHandle($event: any) {
    if ($event.success) {
      this.statusFilter = $event.data.id;
    } else {
      this.statusFilter = null;
    }
  }
  eventCreateByFilterSelectHandle($event: any) {
    if ($event.success) {
      this.userFilter = $event.data.id;
    } else {
      this.userFilter = null;
    }
  }

  showStep(id: string) {
    this.stepData = [];
    this.receptionData.data = [];
    this.recordServiceV2.getStepDropdown(id).subscribe(steps => {
      this.stepData = steps.items;
      this.getRecordData(this.stepData[0].id);
    });
  }

  getStatusData() {
    this.statusData.data = [];
    this.recordServiceV2.getStepReportStatus().subscribe(res => {
      this.statusData.data = res.items;
    });
  }

  getUserData() {
    this.userData.data = [];
    this.userCustomService.getUserDropdownItemByFilter(null).subscribe(res => {
      this.userData.data = res.items;
    });
  }

  getRecordData(stepId: string) {
    this.processStepService.get(stepId).subscribe(step => {
      this.selectedStep = step;
      if (this.selectedStep.isSpecial === 1) {
        const recordStreamCreator = query => {
          const filterModel = {} as StepReportFilterDto;
          filterModel.filter = this.filterText;
          filterModel.sorting = query.sorting;
          filterModel.skipCount = query.skipCount;
          filterModel.maxResultCount = query.maxResultCount;
          filterModel.processStepId = stepId;
          if (this.statusFilter) {
            filterModel.stepStatus = this.statusFilter;
          }
          if (this.userFilter) {
            filterModel.createdBy = this.userFilter;
          }

          if (this.toDate) {
            const date = this.toDate;
            filterModel.creationDateEnd = date.year + '-' + date.month + '-' + date.day;
          }

          if (this.fromDate) {
            const date = this.fromDate;
            filterModel.creationDateStart = date.year + '-' + date.month + '-' + date.day;
          }

          return this.recordServiceV2.getFirstStepReport(filterModel);
        };
        this.list.hookToQuery(recordStreamCreator).subscribe(response => {
          this.record = response;
        });
      }
      if (this.selectedStep.isSpecial === 10) {
        const recordStreamCreator = query => {
          const filterModel = {} as StepReportFilterDto;
          filterModel.filter = this.filterText;
          filterModel.sorting = query.sorting;
          filterModel.skipCount = query.skipCount;
          filterModel.maxResultCount = query.maxResultCount;
          filterModel.processStepId = stepId;
          if (this.statusFilter) {
            filterModel.stepStatus = this.statusFilter;
          }
          if (this.userFilter) {
            filterModel.createdBy = this.userFilter;
          }

          if (this.toDate) {
            const date = this.toDate;
            filterModel.creationDateEnd = date.year + '-' + date.month + '-' + date.day;
          }

          if (this.fromDate) {
            const date = this.fromDate;
            filterModel.creationDateStart = date.year + '-' + date.month + '-' + date.day;
          }
          return this.recordServiceV2.getNormalStepReport(filterModel);
        };
        this.list.hookToQuery(recordStreamCreator).subscribe(response => {
          this.record = response;
        });
      }
      if (this.selectedStep.isSpecial === 20) {
        const recordStreamCreator = query => {
          const filterModel = {} as StepReportFilterDto;
          filterModel.filter = this.filterText;
          filterModel.sorting = query.sorting;
          filterModel.skipCount = query.skipCount;
          filterModel.maxResultCount = query.maxResultCount;
          filterModel.processStepId = stepId;
          if (this.statusFilter) {
            filterModel.stepStatus = this.statusFilter;
          }
          if (this.userFilter) {
            filterModel.createdBy = this.userFilter;
          }

          if (this.toDate) {
            const date = this.toDate;
            filterModel.creationDateEnd = date.year + '-' + date.month + '-' + date.day;
          }

          if (this.fromDate) {
            const date = this.fromDate;
            filterModel.creationDateStart = date.year + '-' + date.month + '-' + date.day;
          }
          return this.recordServiceV2.getLastStepReport(filterModel);
        };
        this.list.hookToQuery(recordStreamCreator).subscribe(response => {
          this.record = response;
        });
      }
    });
  }

  firstStepModalOpen(stepRecordId: any, isEditing: boolean) {
    this.receptionData.data = [];
    this.fieldData = [];
    this.selectedReception = {};
    this.isEditing = isEditing;
    if (this.selectedStep.isSpecial === 1) {
      if (stepRecordId) {
        this.saveRecordId = stepRecordId;
      } else {
        this.saveRecordId = guiEmpty;
      }
      this.getCountryData();
      this.getReceptionDropdown();
      this.enumService.getListCustom({ enumType: 'ReceptionOriginEnum' }).subscribe(res => {
        this.lotDropDown.data = res.items;
        this.selectedReception.receptionType = this.lotDropDown.data[0]?.id;
        this.selectedReception.receptionName = this.lotDropDown.data[0]?.name;
      });

      this.getReceptionData(stepRecordId);
      this.isFirstStepModalOpen = true;
    }
  }

  firstStepViewModalOpen(stepRecordId: any) {
    this.receptionData.data = [];
    this.fieldData = [];
    if (this.selectedStep.isSpecial === 1) {
      if (stepRecordId) {
        this.saveRecordId = stepRecordId;
      } else {
        this.saveRecordId = guiEmpty;
      }
      this.getCountryData();
      this.getReceptionDropdown();
      this.enumService.getListCustom({ enumType: 'ReceptionOriginEnum' }).subscribe(res => {
        this.lotDropDown.data = res.items;
        this.selectedReception.receptionType = this.lotDropDown.data[0].id;
        this.selectedReception.receptionName = this.lotDropDown.data[0].name;
      });
      this.getReceptionData(stepRecordId);
      this.isFirstStepViewModalOpen = true;
    }
  }

  normalStepModalOpen(stepRecordId: any, stepRecordCodeUsed: any[], useAll: number) {
    this.normalStepRecordCode.stepRecordSelected = stepRecordCodeUsed?.map(code => ({
      recordCodeId: code.id,
      name: code.name,
      useAll: code.useAll,
    }));
    if (stepRecordId) {
      this.saveRecordId = stepRecordId;
    } else {
      this.saveRecordId = guiEmpty;
    }
    if (useAll !== undefined && useAll !== null) {
      this.selectedStep.useAll = useAll;
    } else {
      this.selectedStep.useAll = 1;
    }

    this.normalStepRecordCode.recordCodeIds = [];
    if (this.selectedStep.isSpecial === 10) {
      this.isNormalStepModalOpen = true;
      if (stepRecordCodeUsed) {
        this.normalStepRecordCode.recordCodeIds.push(...stepRecordCodeUsed.map(code => code.id));
        this.getRecordCodeDropdown(this.normalStepRecordCode.recordCodeIds);
      } else {
        this.getRecordCodeDropdown(guiEmpty);
      }
      this.fieldData = [];

      this.getFieldData(this.selectedStep.id, stepRecordId, guiEmpty);
    }
  }
  normalStepViewModalOpen(stepRecordId: any, stepRecordCodeUsed: any[], useAll: number) {
    if (stepRecordId) {
      this.saveRecordId = stepRecordId;
    } else {
      this.saveRecordId = guiEmpty;
    }
    if (useAll !== undefined && useAll !== null) {
      this.selectedStep.useAll = useAll;
    } else {
      this.selectedStep.useAll = 1;
    }
    this.normalStepRecordCode.recordCodeIds = [];
    this.normalStepRecordCode.stepRecordSelected = [];
    if (this.selectedStep.isSpecial === 10) {
      this.isNormalStepViewModalOpen = true;
      if (stepRecordCodeUsed) {
        this.normalStepRecordCode.recordCodeIds.push(...stepRecordCodeUsed.map(code => code.id));
        this.getRecordCodeDropdown(this.normalStepRecordCode.recordCodeIds);
      } else {
        this.getRecordCodeDropdown(guiEmpty);
      }
      this.fieldData = [];
      this.getFieldData(this.selectedStep.id, stepRecordId, guiEmpty);
    }
  }

  lastStepModalOpen(stepRecordId: any, stepRecordCodeUsed: any[], useAll: number) {
    this.recordShareData.data = [];
    this.fieldData = [];
    this.selectedlastStep = {};
    this.selectedlastStep.stepRecordSelected = [];
    if (useAll !== undefined && useAll !== null) {
      this.selectedlastStep.useAll = useAll;
    } else {
      this.selectedlastStep.useAll = 1;
    }

    this.selectedlastStep.recordCodeIds = [];

    if (this.selectedStep.isSpecial === 20) {
      this.isLastStepModalOpen = true;
      if (stepRecordId) {
        this.saveRecordId = stepRecordId;
      } else {
        this.saveRecordId = guiEmpty;
      }
      this.getRecordShareData(stepRecordId);
      this.getProductData();
      this.getPartnerData();
      this.getProfileNameData();
    }
  }
  lastStepViewModalOpen(stepRecordId: any, stepRecordCodeUsed: any[], useAll: number) {
    this.recordShareData.data = [];
    this.fieldData = [];
    this.selectedlastStep = {};
    this.selectedlastStep.recordCodeIds = [];
    if (useAll !== undefined && useAll !== null) {
      this.selectedlastStep.useAll = useAll;
    } else {
      this.selectedlastStep.useAll = 1;
    }

    if (this.selectedStep.isSpecial === 20) {
      this.isLastStepViewModalOpen = true;
      if (stepRecordId) {
        this.saveRecordId = stepRecordId;
      } else {
        this.saveRecordId = guiEmpty;
      }
      this.getRecordShareData(stepRecordId);
      this.getProductData();
      this.getPartnerData();
      this.getProfileNameData();
      if (stepRecordCodeUsed) {
        this.selectedlastStep.recordCodeIds.push(...stepRecordCodeUsed.map(code => code.id));
        this.getRecordCodeDropdown(this.selectedlastStep.recordCodeIds);
      } else {
        this.getRecordCodeDropdown(guiEmpty);
      }
    }
  }

  createRecord() {
    if (this.selectedStep.isSpecial === 1) {
      this.firstStepModalOpen(guiEmpty, true);
    }

    if (this.selectedStep.isSpecial === 10) {
      this.normalStepModalOpen(guiEmpty, null, null);
    }

    if (this.selectedStep.isSpecial === 20) {
      this.lastStepModalOpen(guiEmpty, null, null);
    }
  }

  getLotDropDownData() {
    this.enumService.getListCustom({ enumType: 'ReceptionOriginEnum' }).subscribe(res => {
      this.lotDropDown.data = res.items;
    });
  }

  removeValue(value: string) {
    this.recordServiceV2.deleteReception(value).subscribe(res => {
      if (res) {
        this.getReceptionData(this.saveRecordId);
        this.toaster.success('::Record:Delete:Success');
      }
    });
  }

  removeRecordShare($event, value: string) {
    $event.stopPropagation();
    this.recordServiceV2.deleteRecordShare(value).subscribe(res => {
      if (res) {
        if (
          this.selectedStep &&
          this.recordShareData.data &&
          Array.isArray(this.recordShareData.data)
        ) {
          this.recordShareData.data = this.recordShareData.data.filter(item => item.id !== value);
        }
        this.toaster.success('::Record:Delete:Success');
      }
    });
  }

  getCountryData() {
    this.countryData.data = [];
    this.locationService.getCountryDropdown().subscribe(res => {
      this.countryData.data = res.items;
    });
  }

  getProvinceData(countryId: string) {
    this.provinceData.data = [];
    return this.locationService.getProvinceDropdown(countryId).pipe(
      tap(res => {
        this.provinceData.data = res.items;
      })
    );
  }

  getDistrictData(provinceId: string) {
    this.districtData.data = [];
    return this.locationService.getDistrictDropdown(provinceId).pipe(
      tap(res => {
        this.districtData.data = res.items;
      })
    );
  }

  getReceptionDropdown() {
    this.receptionDropdown.data = [];
    this.recordServiceV2
      .getReceptionDropdown(this.selectedStep.id, this.saveRecordId)
      .subscribe(res => {
        this.receptionDropdown.data = res.items;
      });
  }

  getRecordCodeDropdown(entityId: any) {
    this.recordCodeDropdown.data = [];
    this.recordServiceV2.getStepRecordDropdown(this.selectedStep.id, entityId).subscribe(res => {
      this.ngZone.run(() => {
        this.recordCodeDropdown.data = res.items;
      });
    });
  }

  eventCountrySelectHandle($event: any) {
    if ($event.success) {
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.selectedReception.countryId = $event.data.id;
    }
  }

  eventProvinceSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.selectedReception.provinceId = $event.data.id;
    }
  }

  eventDistrictSelectHandle($event: any) {
    if ($event.success) {
      this.selectedReception.districtId = $event.data.id;
    }
  }

  eventReceptionSelectHandle($event: any) {
    if (this.selectedStep && $event.success) {
      this.selectedReception.recordSharedId = $event.data.id;
    }
  }

  eventLotSelectHandle(selectedValue: any) {
    this.selectedReception.receptionType = selectedValue.id;
    this.selectedReception.receptionName = selectedValue.name;
  }

  getReceptionData(stepRecordId: any) {
    this.receptionData.data = [];
    this.recordServiceV2.getReception(stepRecordId).subscribe(res => {
      this.receptionData.data = res.items;
    });
  }

  checkUserAdmin(data: any) {
    return this.currentUser.name.includes('admin');
  }

  // todo:
  getFieldData(selectedStepId, stepRecordId, entityValue: any) {
    this.executorData.data = this.selectedStep.userTags;
    this.fieldData = [];
    this.countryData.selected = [];
    this.provinceData.selected = [];
    this.districtData.selected = [];
    this.receptionDropdown.selected = [];
    this.entityValue = {};
    this.entityValue = entityValue && entityValue.id !== undefined ? entityValue.id : guiEmpty;
    if (entityValue && this.selectedStep.isSpecial === 1) {
      this.selectedReception = entityValue;

      this.selectedReception.receptionType = entityValue.receptionType;

      this.selectedReception.receptionName = this.lotDropDown.data.find(
        item => item.id === entityValue.receptionType
      )?.name;
      if (entityValue.receptionType === 5) {
        this.countryData.selected = this.findItemById(this.countryData.data, entityValue.countryId);
        this.getProvinceData(entityValue.countryId).subscribe(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            entityValue.provinceId
          );
        });
        this.getDistrictData(entityValue.provinceId).subscribe(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            entityValue.districtId
          );
        });
      }
      this.receptionDropdown.selected = this.findItemById(
        this.receptionDropdown.data,
        entityValue.recordSharedId
      );
    }

    this.productData.selected = [];
    this.profileNameData.selected = [];
    this.partnerData.selected = [];
    if (entityValue && this.selectedStep.isSpecial === 20) {
      this.recordServiceV2.getRecordShareDetail(entityValue.id).subscribe(res => {
        this.selectedlastStep = res;
        this.selectedlastStep.stepRecordSelected = res.recordCodeSelected;
        if (res.recordCodeSelected) {
          this.selectedlastStep.recordCodeIds.push(
            ...res.recordCodeSelected.map(code => code.recordCodeId)
          );
          this.getRecordCodeDropdown(this.selectedlastStep.recordCodeIds);
        }
        this.productData.selected = this.findItemById(this.productData.data, res.productId);
        this.partnerData.selected = this.findItemById(this.partnerData.data, res.partnerId);
        this.profileNameData.selected = this.findItemById(
          this.profileNameData.data,
          res.companyProfileId
        );
      });
    }
    if (!entityValue && this.selectedStep.isSpecial === 20) {
      this.getRecordCodeDropdown(guiEmpty);
    }

    this.recordServiceV2
      .getStepResponseByStepIdAndStepRecordIdAndEntityValue(
        selectedStepId,
        stepRecordId,
        this.entityValue
      )
      .subscribe(res => {
        this.fieldData = res.items;

        if (this.fieldData.length > 0) {
          this.processStepResponseId = this.fieldData[0].processStepResponseId;
          this.fieldData.forEach(field => {
            this.initializeSelectedOptions(field);
          });
        }
      });
  }

  async initializeSelectedOptions(field: any) {
    if (field.dataType === 2) {
      this.selectedOptionsMap.set(field.processFieldId, []);
      const selectedIds = field.options.filter(option => option.selected).map(option => option.id);
      this.selectedOptionsMap.set(field.processFieldId, selectedIds);
    }
    if (field.dataType === 5) {
      if (!field.options[0].responseText) {
        const currentDate: number = new Date().getTime();

        field.options[0].responseText = currentDate;
      }
      const date = new Date(field.options[0].responseText);
      field.options[0].responseText = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
    }
    if (field.dataType === 4) {
      const number = Number(field.options[0].responseText);
      field.options[0].responseText = number;
    }
    if (field.dataType === 6) {
      try {
        field.tempSelectedImages = [];

        for (let i = 0; i < field.options.length; i++) {
          if (field.options[i].responseText) {
            field.tempSelectedImages.push({
              url: await firstValueFrom(
                this.fileService.getFileUrlByFileName(field.options[i].responseText)
              ),
            });
          }
        }
      } catch (error) {
        console.error('Error fetching file URL', error);
      }
    }
  }

  updateSelectedOptions(field: any, selectedValues: any[]) {
    this.selectedOptionsMap.set(field.processFieldId, selectedValues);

    field.options.forEach(option => {
      option.selected = selectedValues.includes(option.id);
    });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id) || {};
  }

  getStartEndNumber() {
    if (this.selectedlastStep.numberOfStamp < 0 || !this.selectedlastStep.numberOfStamp) {
      this.selectedlastStep.numberOfStamp = 0;
      this.toaster.error('::Record:StampNumberTooSmall');
      return;
    }
    this.recordServiceV2.generateStampNumber(this.selectedlastStep.numberOfStamp).subscribe(res => {
      this.selectedlastStep.startNumber = res.startNumber;
      this.selectedlastStep.endNumber = res.endNumber;
    });
  }

  getRecordShareData(stepRecordId) {
    this.recordShareData.data = [];
    this.recordServiceV2.getRecordShare(stepRecordId).subscribe(res => {
      this.recordShareData.data = res.items;
    });
  }

  getProductData() {
    this.productData.data = [];
    this.productService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
    });
  }

  getProfileNameData() {
    this.profileNameData.data = [];
    this.companyService.getDropdownList().subscribe(res => {
      this.profileNameData.data = res.items;
    });
  }

  getPartnerData() {
    this.partnerData.data = [];
    this.partnerService.getPartnerDropdown().subscribe(res => {
      this.partnerData.data = res.items;
    });
  }

  eventProductSelectHandle($event: any) {
    if ($event.success) {
      this.selectedlastStep.productId = $event.data.id;
    } else {
      this.selectedlastStep.productId = null;
    }
  }

  eventProfileSelectHandle($event: any) {
    if ($event.success) {
      this.selectedlastStep.companyProfileId = $event.data.id;
    } else {
      this.selectedlastStep.companyProfileId = null;
    }
  }

  eventPartnerSelectHandle($event: any) {
    if ($event.success) {
      this.selectedlastStep.partnerId = $event.data.id;
    } else {
      this.selectedlastStep.partnerId = null;
    }
  }
  getSelectedOptionName(field: any): string {
    const selectedOption = field.options.find(option => option.selected === true);
    return selectedOption ? selectedOption.name : '';
  }

  getSelectedOption(field: any) {
    const selectedOptions = field.options.find(option => option.selected);
    return selectedOptions || {};
  }

  eventExecutorSelectHandle($event: any, field: any) {
    if ($event.success) {
      field.executorId = $event.data.id;
    } else {
      field.executorId = null;
    }
  }

  eventDropdownSelectHandle(field: any, selectedIndex: number) {
    field.options.forEach((option, index) => {
      option.selected = index === selectedIndex;
    });
  }

  saveRecordResponse(
    isDone: boolean,
    closeModal: boolean,
    recordId: string
  ): Observable<string | null> {
    this.isSaving = true;
    let isError = false;
    if (!this.receptionErrorCheck()) {
      isError = true;
    }
    if (isError) {
      return of(null);
    }

    this.fieldData.forEach(async field => {
      if (!this.checkUserAdmin(null)) {
        field.executorId = this.currentUser.id;
      }
      // text
      if (field.dataType >= 3 && field.dataType <= 6) {
        field.options[0].selected = true;
      }
      // number
      if (field.dataType === 4) {
        if (!field.options[0].responseText) {
          field.options[0].responseText = 0;
        }
        const numberInput = field.options[0].responseText;
        field.options[0].responseText = numberInput.toString();
      }
      // datetime
      if (field.dataType === 5) {
        const dateSelect = field.options[0].responseText;
        // if bug here, please check the responseText datatype in obj set string to any
        if (!dateSelect) {
          field.options[0].submissionText = '';
          return;
        }
        const dateString = dateSelect.day + '-' + dateSelect.month + '-' + dateSelect.year;
        field.options[0].submissionText = dateString;
      }

      if (field.dataType === 6) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedImages && field.tempSelectedImages.length > 0) {
          for (let i = 0; i < field.tempSelectedImages.length; i++) {
            const imageFile = field.tempSelectedImages[i].file;
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = imageFile.name.split('.').pop();
            const imageName = `${timestamp}_${randomSuffix}.${fileType}`;
            const fileId = await this.uploadFile(imageFile, imageName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No images selected for this field');
        }
        field.options[0] = {
          id: field.options[0].processFieldOptionId,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(';'),
          selected: true,
        };
      }

      if (field.dataType === 7) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedFiles && field.tempSelectedFiles.length > 0) {
          for (let i = 0; i < field.tempSelectedFiles.length; i++) {
            const file = field.tempSelectedFiles[i];
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomSuffix}.${fileType}`;
            const fileId = await this.uploadFile(file, fileName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No document selected for this field');
        }
        field.options[0] = {
          id: field.options[0].id,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(','),
          selected: true,
        };
      }

      if (!field.executorId && field.isObligatory) {
        this.toaster.error('::Record:ExecutorRequire');
        isError = true;
      }

      if (field.isObligatory) {
        switch (field.dataType) {
          case 1:
          case 2:
            if (!field.options.some(option => option.selected === true)) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 3:
          case 4:
            if (!field.options[0].responseText) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 5:
            if (!field.options[0].responseText || field.options[0].responseText === 'NaN-NaN-NaN') {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
        }
        if (field.dataType >= 10 && field.dataType < 20) {
          const isSelected = field.options.some(option => option.selected);
          if (!isSelected) {
            const positionMessage = ` (Position: ${field.position + 1})`;
            this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);
            isError = true;
          }
        }
      }
    });
    if (isError) {
      return of(null);
    }
    const input = {} as CreateUpdateStepReportFirstDto;
    input.processStepId = this.selectedStep.id;
    input.stepReportId = recordId;
    input.recordStatus = isDone;
    input.reception = this.selectedReception;
    input.fieldRecords = this.fieldData.map(field => {
      const fieldCopy = { ...field };

      if (field.dataType === 5) {
        fieldCopy.options = field.options.map(option => {
          const optionCopy = { ...option };
          if (option.submissionText) {
            optionCopy.responseText = option.submissionText;
          }
          return optionCopy;
        });
      }

      return fieldCopy;
    });
    return this.recordServiceV2.saveRecordResponse(input).pipe(
      catchError(error => {
        return of(null);
      }),
      map(res => {
        this.getRecordData(this.selectedStep.id);

        this.fieldData = [];
        this.selectedReception = {};
        this.isFirstStepModalOpen = closeModal;
        this.toaster.success('::Success');
        if (isDone) {
          this.toaster.success('::Record:Done:Success');
        }
        this.isSaving = false;
        return res;
      })
    );
  }

  saveNormalStepResponse(isDone: boolean, closeModal: boolean, recordId: string) {
    this.isSaving = true;
    let isError = false;
    if (!this.normalStepErrorCheck()) {
      isError = true;
    }

    if (isError) {
      return of(null);
    }
    this.fieldData.forEach(async field => {
      if (!this.checkUserAdmin(null)) {
        field.executorId = this.currentUser.id;
      }
      if (field.dataType >= 3 && field.dataType <= 6) {
        field.options[0].selected = true;
      }
      if (field.dataType === 4) {
        if (!field.options[0].responseText) {
          field.options[0].responseText = 0;
        }
        const numberInput = field.options[0].responseText;
        field.options[0].responseText = numberInput.toString();
      }
      if (field.dataType === 5) {
        const dateSelect = field.options[0].responseText;
        if (!dateSelect) {
          field.options[0].submissionText = '';
          return;
        }
        const dateString = dateSelect.day + '-' + dateSelect.month + '-' + dateSelect.year;
        field.options[0].submissionText = dateString;
      }

      if (field.dataType === 6) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedImages && field.tempSelectedImages.length > 0) {
          for (let i = 0; i < field.tempSelectedImages.length; i++) {
            const imageFile = field.tempSelectedImages[i].file;
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = imageFile.name.split('.').pop();
            const imageName = `${timestamp}_${randomSuffix}.${fileType}`;
            const fileId = await this.uploadFile(imageFile, imageName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No images selected for this field');
        }
        field.options[0] = {
          id: field.options[0].processFieldOptionId,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(';'),
          selected: true,
        };
      }

      if (field.dataType === 7) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedFiles && field.tempSelectedFiles.length > 0) {
          for (let i = 0; i < field.tempSelectedFiles.length; i++) {
            const file = field.tempSelectedFiles[i];
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomSuffix}.${fileType}`;
            const fileId = await this.uploadFile(file, fileName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No document selected for this field');
        }
        field.options[0] = {
          id: field.options[0].id,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(','),
          selected: true,
        };
      }

      if (!field.executorId && field.isObligatory) {
        this.toaster.error('::Record:ExecutorRequire');
        isError = true;
      }
      if (field.isObligatory) {
        switch (field.dataType) {
          case 1:
          case 2:
            if (!field.options.some(option => option.selected === true)) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 3:
          case 4:
            if (!field.options[0].responseText) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 5:
            if (!field.options[0].responseText || field.options[0].responseText === 'NaN-NaN-NaN') {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
        }
        if (field.dataType > 10 && field.dataType < 20) {
          if (!field.options.some(option => option.selected === true)) {
            const positionMessage = ` (${field.position + 1})`;

            this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

            isError = true;
          }
        }
      }
    });

    if (isError) {
      return of(null);
    }
    const input = {} as CreateUpdateStepReportNormalDto;
    input.recordCodeSelected = this.normalStepRecordCode.stepRecordSelected;
    // input.useAll = this.selectedStep.useAll;
    input.processStepId = this.selectedStep.id;
    input.stepReportId = recordId;
    input.recordStatus = isDone;

    input.fieldRecords = this.fieldData.map(field => {
      const fieldCopy = { ...field };

      if (field.dataType === 5) {
        fieldCopy.options = field.options.map(option => {
          const optionCopy = { ...option };
          if (option.submissionText) {
            optionCopy.responseText = option.submissionText;
          }
          return optionCopy;
        });
      }

      return fieldCopy;
    });
    this.recordServiceV2.saveRecordResponseNormal(input).subscribe(res => {
      this.getRecordData(this.selectedStep.id);
      this.fieldData = [];
      this.normalStepRecordCode = {};
      this.isNormalStepModalOpen = closeModal;
      this.toaster.success('::Success');
      if (isDone) {
        this.toaster.success('::Record:Done:Success');
      }
      this.isSaving = false;
    });
  }

  async saveLastStepResponse(
    isDone: boolean,
    closeModal: boolean,
    RecordId: string
  ): Promise<string | null> {
    let isError = false;
    this.isSaving = true;

    if (!this.lastStepErrorCheck()) {
      isError = true;
    }

    if (isError) {
      return null;
    }
    for (const field of this.fieldData) {
      if (!this.checkUserAdmin(null)) {
        field.executorId = this.currentUser.id;
      }

      if (field.dataType >= 3 && field.dataType <= 6) {
        field.options[0].selected = true;
      }

      if (field.dataType === 4) {
        if (!field.options[0].responseText) {
          field.options[0].responseText = 0;
        }
        const numberInput = field.options[0].responseText;

        field.options[0].responseText = numberInput.toString();
      }
      if (field.dataType === 5) {
        const dateSelect = field.options[0].responseText;
        // if bug here, please check the responseText datatype in obj set string to any
        if (!dateSelect) {
          field.options[0].submissionText = '';
          return;
        }
        const dateString = dateSelect.day + '-' + dateSelect.month + '-' + dateSelect.year;
        field.options[0].submissionText = dateString;
      }

      if (field.dataType === 6) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedImages && field.tempSelectedImages.length > 0) {
          for (let i = 0; i < field.tempSelectedImages.length; i++) {
            const imageFile = field.tempSelectedImages[i].file;
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = imageFile.name.split('.').pop();
            const imageName = `${timestamp}_${randomSuffix}.${fileType}`;
            const fileId = await this.uploadFile(imageFile, imageName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No images selected for this field');
        }
        field.options[0] = {
          id: field.options[0].processFieldOptionId,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(';'),
          selected: true,
        };
      }
      if (field.dataType === 7) {
        const existing = field.options[0].responseText || '';
        const existingFiles = existing.split(',').filter(x => x && !this.deletedFileId.includes(x));
        const newFileIds: string[] = [];
        if (field.tempSelectedFiles && field.tempSelectedFiles.length > 0) {
          for (let i = 0; i < field.tempSelectedFiles.length; i++) {
            const file = field.tempSelectedFiles[i];

            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileType = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomSuffix}.${fileType}`;

            const fileId = await this.uploadFile(file, fileName); // <- Upload here
            const cleanFileId = fileId.replace(/^"(.*)"$/, '$1');
            newFileIds.push(cleanFileId);
          }
        } else {
          console.error('No document selected for this field');
        }
        field.options[0] = {
          id: field.options[0].id,
          processFieldOptionId: field.options[0].processFieldOptionId,
          name: '',
          responseText: [...existingFiles, ...newFileIds].join(','),
          selected: true,
        };
      }
      if (!field.executorId && field.isObligatory) {
        this.toaster.error('::Record:ExecutorRequire');
        isError = true;
      }
      if (field.isObligatory) {
        switch (field.dataType) {
          case 1:
          case 2:
            if (!field.options.some(option => option.selected === true)) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 3:
          case 4:
            if (!field.options[0].responseText) {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
          case 5:
            if (!field.options[0].responseText || field.options[0].responseText === 'NaN-NaN-NaN') {
              const positionMessage = ` (${field.position + 1})`;

              this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

              isError = true;
            }
            break;
        }
        if (field.dataType > 10 && field.dataType < 20) {
          if (!field.options.some(option => option.selected === true)) {
            const positionMessage = ` (${field.position + 1})`;

            this.toaster.error('::Record:ObligatoryFieldRequire' + positionMessage);

            isError = true;
          }
        }
      }
    }
    if (isError) {
      return null;
    }
    const input = {} as CreateUpdateStepReportLastDto;
    input.recordShare = this.selectedlastStep;
    input.recordShare.useAll = this.selectedlastStep.useAll;
    input.recordShare.recordCodeSelected = this.selectedlastStep.stepRecordSelected;
    input.recordCodeSelected = this.selectedlastStep.stepRecordSelected;
    input.processStepId = this.selectedStep.id;
    input.stepReportId = RecordId !== undefined ? RecordId : guiEmpty;
    input.recordStatus = isDone;
    input.lotId = this.selectedlastStep.lotId;

    input.fieldRecords = this.fieldData.map(field => {
      const fieldCopy = { ...field };
      if (field.dataType === 5) {
        fieldCopy.options = field.options.map(option => {
          const optionCopy = { ...option };
          if (option.submissionText) {
            optionCopy.responseText = option.submissionText;
          }
          return optionCopy;
        });
      }

      return fieldCopy;
    });
    try {
      const res = await this.recordServiceV2.saveRecordResponseLast(input).toPromise();
      this.isSaving = false;
      this.getRecordData(this.selectedStep.id);
      this.fieldData = [];
      this.selectedlastStep = {
        stepRecordSelected: [],
      };
      this.isLastStepModalOpen = closeModal;
      this.toaster.success('::Success');
      return res;
    } catch {
      return null;
    }
  }

  eventListObjectSelectCustomHandle($event: any, options: any) {
    if ($event.success) {
      options.forEach(option => {
        option.selected = false;
      });
      const selectedOption = options.find(
        option => option.processFieldOptionId === $event.data.processFieldOptionId
      );
      selectedOption.selected = true;
    } else {
      options.forEach(option => {
        option.selected = false;
      });
    }
  }

  async saveAndRenew(isDone: boolean) {
    if (this.fieldData.length > 0) {
      if (this.selectedStep.isSpecial === 1)
        this.saveRecordResponse(isDone, true, this.saveRecordId)?.subscribe(recordId => {
          if (recordId) {
            recordId = recordId.replace(/^"(.*)"$/, '$1');
            this.saveRecordId = recordId;

            this.getReceptionData(recordId);
            this.getFieldData(this.selectedStep.id, null, null);
          }
        });
      if (this.selectedStep.isSpecial === 20) {
        const recordId = await this.saveLastStepResponse(isDone, true, this.saveRecordId);

        if (recordId) {
          const cleanRecordId = recordId.replace(/^"(.*)"$/, '$1');
          this.saveRecordId = cleanRecordId;
          this.getRecordShareData(cleanRecordId);
          this.getFieldData(this.selectedStep.id, null, null);
        }
      }
    }
  }
  delete(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.recordServiceV2.deleteStepRecord(id).subscribe(() => {
          this.getRecordData(this.selectedStep.id);
          this.toaster.success('::Delete:Success');
        });
      }
    });
  }

  handleImageSelect(event: any, field: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    field.tempSelectedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = URL.createObjectURL(file);

      field.tempSelectedImages.push({
        file: file,
        url: imageUrl,
      });
    }
  }

  async uploadFile(file: File, fileName: string) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return await lastValueFrom(this.fileService.uploadFileWithSaveByFile(formData));
  }

  recordingSetDone(id) {
    this.recordServiceV2.setStepRecordDone(id).subscribe(res => {
      if (res) {
        this.toaster.success('::Record:Done:Success');
        this.list.get();
        if (this.isFirstStepModalOpen) {
          this.isFirstStepModalOpen = false;
        }
        if (this.isLastStepModalOpen) {
          this.isLastStepModalOpen = false;
        }
      }
    });
  }

  deleteImage(field: any, index: number): void {
    const removed = field.tempSelectedImages.splice(index, 1)[0];
    URL.revokeObjectURL(removed.url);
  }

  receptionErrorCheck() {
    if (!this.selectedReception.receptionType) {
      this.toaster.error('::Record:ReceptionTypeRequire');

      return false;
    }
    if (this.selectedReception.receptionType === 1) {
      if (!this.selectedReception.recordSharedId) {
        this.toaster.error('::Record:ReceptionRequire');

        return false;
      }

      this.selectedReception.countryId = null;
      this.selectedReception.provinceId = null;
      this.selectedReception.districtId = null;
    }
    if (this.selectedReception.receptionType === 5) {
      if (
        !this.selectedReception ||
        !this.selectedReception.countryId ||
        !this.selectedReception.provinceId ||
        !this.selectedReception.districtId
      ) {
        this.toaster.error('::Record:OriginRequire');
        return false;
      }
      this.selectedReception.recordSharedId = null;
    }
    return true;
  }

  normalStepErrorCheck() {
    if (
      !this.normalStepRecordCode.recordCodeIds ||
      this.normalStepRecordCode.recordCodeIds.length === 0
    ) {
      this.toaster.error('::Record:RecordCodeRequire');
      return false;
    } else return true;
  }

  lastStepErrorCheck() {
    if (
      !this.selectedlastStep.recordCodeIds ||
      this.selectedlastStep.recordCodeIds.length === 0 ||
      !this.selectedlastStep.productId ||
      !this.selectedlastStep.companyProfileId ||
      !this.selectedlastStep.numberOfStamp
    ) {
      this.toaster.error('::Record:RecordShareRequire');
      return false;
    }

    return true;
  }
  validateStampNumber(stampNumber) {
    this.recordServiceV2.checkStampNumberInputByStampNumber(stampNumber).subscribe(res => {
      if (!res) {
        this.toaster.error('::Record:startEndNumberInvalid');
      }
    });
    if (
      this.selectedlastStep.startNumber !== undefined &&
      this.selectedlastStep.endNumber !== undefined
    ) {
      if (this.selectedlastStep.endNumber < this.selectedlastStep.startNumber) {
        this.toaster.error('::Record:EndNumberToSmall');
        this.selectedlastStep.numberOfStamp = 0;
      } else {
        const sumStamb = this.selectedlastStep.endNumber - this.selectedlastStep.startNumber + 1;

        this.selectedlastStep.numberOfStamp = sumStamb;
      }
    }
  }

  onCheckboxChange() {
    if (this.selectedStep.isSpecial === 10) {
      this.selectedStep.useAll = this.selectedStep.useAll === 0 ? 1 : 0;
    }
    if (this.selectedStep.isSpecial === 20) {
      // this.selectedlastStep.useAll = this.selectedlastStep.useAll === 0 ? 1 : 0;
    }
  }
  recordShareRowClick($event: any) {
    if ($event.type == 'click' && $event.row.id) {
      this.getFieldData(this.selectedStep.id, this.saveRecordId, $event.row);
    }
  }

  viewTraceability(viewTraceabilityUrl: any) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/end-user/traceability-info?doc=' + viewTraceabilityUrl;
    window.location.href = fullLink;
  }

  removeRecordCodeNormalStep(record: any) {
    this.removeRecordCode(
      record,
      this.normalStepRecordCode.recordCodeIds,
      this.normalStepRecordCode.stepRecordSelected
    );
  }

  normalStepRecordCodeChange($event: any) {
    this.stepNormalRecordSelectedChange(
      $event,
      this.normalStepRecordCode.stepRecordSelected,
      this.recordCodeDropdown
    );
  }
  removeRecordCodeLastStep(record: any) {
    this.removeRecordCode(
      record,
      this.selectedlastStep.recordCodeIds,
      this.selectedlastStep.stepRecordSelected
    );
  }

  lastStepRecordCodeChange($event: any) {
    this.stepRecordSelectedChange(
      $event,
      this.selectedlastStep.stepRecordSelected,
      this.recordCodeDropdown
    );
  }
  removeRecordCode(record: any, recordCodeIds: any, stepRecordSelected: any) {
    recordCodeIds.find((item, index) => {
      if (item === record.recordCodeId) {
        recordCodeIds.splice(index, 1);
      }
    });
    stepRecordSelected.find((item, index) => {
      if (item && item.recordCodeId === record.recordCodeId) {
        stepRecordSelected.splice(index, 1);
      }
    });
  }

  stepRecordSelectedChange(
    selectedIds: number[],
    lstStepRecordSelected: any[],
    recordCodeDropdown: any
  ) {
    const selectedSet = new Set(selectedIds);

    // Add new selected items
    selectedIds.forEach(id => {
      if (!lstStepRecordSelected.some(item => item.recordCodeId === id)) {
        const found = recordCodeDropdown.data.find(d => d.id === id);
        if (found) {
          lstStepRecordSelected.push({
            recordCodeId: found.id,
            name: found.name,
            useAll: true,
          });
        }
      }
    });

    // Remove unselected items
    for (let i = lstStepRecordSelected.length - 1; i >= 0; i--) {
      if (!selectedSet.has(lstStepRecordSelected[i].recordCodeId)) {
        lstStepRecordSelected.splice(i, 1);
      }
    }
  }

  stepNormalRecordSelectedChange(
    selectedIds: any,
    lstStepRecordSelected: any[],
    recordCodeDropdown: any
  ) {
    const updatedList = selectedIds
      .map(element => {
        let item = lstStepRecordSelected.find(item => item.recordCodeId === element);
        if (!item) {
          item = recordCodeDropdown.data
            .filter(dropdownItem => dropdownItem.id === element)
            .map(dropdownItem => ({
              recordCodeId: dropdownItem.id,
              name: dropdownItem.name,
              useAll: true,
            }))[0];
        }
        return item;
      })
      .filter(item => !!item);
    this.normalStepRecordCode.stepRecordSelected = updatedList;
  }

  getFileIconClass(fileName: string, field: any): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'pdf':
        // Icon cho PDF
        return 'far fa-file-pdf file-icon pdf-icon';
      case 'doc':
      case 'docx':
        // Icon cho Word
        return 'far fa-file-word file-icon doc-icon';
      default:
        // Icon mặc định cho các loại file khác (nếu có)
        return 'far fa-file file-icon default-icon';
    }
  }

  deleteDocumentFile(field: any, index: number): void {
    const removed = field.tempSelectedImages.splice(index, 1)[0];
    URL.revokeObjectURL(removed.url);
  }

  eventFileDeletedHandle(fileId) {
    if (fileId) {
      this.deletedFileId.push(fileId);
    }
  }

  onDocumentFileChange(event: any, field: any): void {
    // 1. Lấy danh sách file và giới hạn số lượng
    const files: File[] = Array.from(event.target.files);
    const validExtensions = ['pdf', 'doc', 'docx'];
    if (!field.tempSelectedFiles) {
      field.tempSelectedFiles = [];
    }
    if (files.length > 10) {
      this.toastyService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }

    // --- Logic Kiểm Tra Định Dạng File ---
    // 2. Lọc ra các file KHÔNG HỢP LỆ (để hiển thị thông báo lỗi)
    const invalidFiles = files.filter(file => {
      // Lấy phần mở rộng của file
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      // Trả về TRUE nếu phần mở rộng KHÔNG nằm trong danh sách hợp lệ
      return !validExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      this.toastyService.error('::UnsupportedFormat', '::Error');
      return;
    }

    // --- Tiếp tục xử lý nếu TẤT CẢ file đều HỢP LỆ ---
    const documentFilesToProcess = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return validExtensions.includes(ext);
    });

    // Xử lý đọc DataURL
    for (const file of documentFilesToProcess) {
      field.tempSelectedFiles.push(file);
    }
  }
}
