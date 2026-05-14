import { ChangeDetectorRef, Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { CompanyProfileService } from '@proxy/traceverified/trace-farm/companies';
import { DoneDto, ShareDto, RecieveDto } from 'src/app/serviceCustom/test-service/record';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners/';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs/operators';
import { ProcessFieldFilterDto } from '@proxy/traceverified/trace-farm/process-managements';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
const options: Partial<Confirmation.Options> = {
  hideCancelBtn: false,
  hideYesBtn: true,
  dismissible: false,
  cancelText: 'Cancel',
};
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import {
  ProcessStepService,
  ProcessService,
  ProcessStepFilterDto,
} from '@proxy/traceverified/trace-farm/process-managements';
import { ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';
import {
  CreateUpdateRecordResponseDto,
  TraceabilityRecordDto,
  TraceabilityRecordFilterDto,
  TraceabilityRecordingDto,
  TraceabilityRecordService,
} from '@proxy/traceverified/trace-farm/traceability-records';
import { Router } from '@angular/router';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
  providers: [ListService],
})
export class RecordComponent implements OnInit {
  @ViewChildren(TypeheadFocusComponent) typeheadFocusComponents: QueryList<TypeheadFocusComponent>;

  fromDate: string;
  toDate: string;
  filterText: string = null;
  recordForm: FormGroup;
  doneForm: FormGroup;
  record = { items: [], totalCount: 0 } as PagedResultDto<TraceabilityRecordingDto>;
  done = { items: [], totalCount: 0 } as PagedResultDto<DoneDto>;
  share = { items: [], totalCount: 0 } as PagedResultDto<ShareDto>;
  receive = { items: [], totalCount: 0 } as PagedResultDto<RecieveDto>;
  isRecordModalOpen = false;
  isNewrecordModalOpen = false;
  isDoneModalOpen = false;
  isAdditionalModalOpen = false;
  isTraceCodeModalOpen = false;
  selectedRecord = {} as TraceabilityRecordDto;
  selectedDone = [] as DoneDto;
  profileNameData: any = {};
  isCollapsed = true;
  processData: any = {};
  filterProfile: string;
  filterProcess: string;
  activeId: number = 1;
  defaultTabId: number = 2;
  navStepId: number = 1;
  isDetail = false;
  selectedStep: any;
  fieldData: any = [];
  stepData: any = [];
  selectedFiles: File[] = [];
  imageSrc: (string | ArrayBuffer)[] = [];
  numberImageUpload: number[] = [];
  firstStepSelected: boolean = false;
  lotDropDown: any = {};
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  receptionData: any = {};
  selectedReception: any = {};
  selectedOriginId: any[] = [];
  currentSelection: any = {};
  productData: any = {};
  partnerData: any = {};
  selectedLastTab: any = {};
  executorData: any = {};
  receptionDropdown: any = {};
  entityValue: any = {};
  processStepResponseId: string;
  recordShareData: any = {};
  entityType: number;
  constructor(
    public readonly list: ListService,
    // private recordService: MockRecordService,
    private recordService: TraceabilityRecordService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    // private processService: MockProcessService,
    private fileService: StorageService,
    private locationService: LocationService,
    private processStepService: ProcessStepService,
    private processService: ProcessService,
    private productManageMentService: ProductService,
    private partnerService: PartnerService,
    private profileService: CompanyProfileService,
    private toaster: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    this.getProductData();
    this.getCountryData();
    this.getLotDropDownData();
    this.getPartnerData();
    this.defaultTabId = 2;
    this.activeId = 1;
    this.numberImageUpload = Array.from({ length: 5 }, (_, index) => index);
    this.getProfileNameData();
    this.getProcessData();
    const recordStreamCreator = query => {
      const filterModel = {} as TraceabilityRecordFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterProfile) {
        filterModel.companyProfileId = this.filterProfile;
      }
      if (this.filterProcess) {
        filterModel.companyProfileId = this.filterProcess;
      }
      if (this.toDate) {
        const date = new Date(this.toDate);
        filterModel.toDate = date.toLocaleDateString();
      }

      if (this.fromDate) {
        const date = new Date(this.fromDate);
        filterModel.fromDate = date.toLocaleDateString();
      }

      return this.recordService.getListRecording(filterModel);
    };
    this.list.hookToQuery(recordStreamCreator).subscribe(response => {
      this.record = response;
    });
    const doneStreamCreator = query => {
      const filterModel = {} as TraceabilityRecordFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterProfile) {
        filterModel.companyProfileId = this.filterProfile;
      }
      if (this.filterProcess) {
        filterModel.companyProfileId = this.filterProcess;
      }
      if (this.toDate) {
        const date = new Date(this.toDate);
        filterModel.toDate = date.toLocaleDateString();
      }

      if (this.fromDate) {
        const date = new Date(this.fromDate);
        filterModel.fromDate = date.toLocaleDateString();
      }
      return this.recordService.getListDone(filterModel);
    };
    this.list.hookToQuery(doneStreamCreator).subscribe(response => {
      this.done = response;
    });
    // const shareStreamCreator = query => {
    //   const filterModel = {} as TraceabilityRecordFilterDto;
    //   filterModel.filter = this.filterText;
    //   filterModel.sorting = query.sorting;
    //   filterModel.skipCount = query.skipCount;
    //   filterModel.maxResultCount = query.maxResultCount;
    //   if (this.filterProfile) {
    //     filterModel.companyProfileId = this.filterProfile;
    //   }
    //   if (this.filterProcess) {
    //     filterModel.companyProfileId = this.filterProcess;
    //   }
    //   if (this.toDate) {
    //     const date = new Date(this.toDate);
    //     filterModel.toDate = date.toLocaleDateString();
    //   }
    //
    //   if (this.fromDate) {
    //     const date = new Date(this.fromDate);
    //     filterModel.fromDate = date.toLocaleDateString();
    //   }
    //   return this.recordService.getListShare(filterModel);
    // };
    // this.list.hookToQuery(shareStreamCreator).subscribe(response => {
    //   this.share = response;
    // });
    // const recieveStreamCreator = query => {
    //   const filterModel = {} as TraceabilityRecordFilterDto;
    //   filterModel.filter = this.filterText;
    //   filterModel.sorting = query.sorting;
    //   filterModel.skipCount = query.skipCount;
    //   filterModel.maxResultCount = query.maxResultCount;
    //   if (this.filterProfile) {
    //     filterModel.companyProfileId = this.filterProfile;
    //   }
    //   if (this.filterProcess) {
    //     filterModel.companyProfileId = this.filterProcess;
    //   }
    //   if (this.toDate) {
    //     const date = new Date(this.toDate);
    //     filterModel.toDate = date.toLocaleDateString();
    //   }
    //
    //   if (this.fromDate) {
    //     const date = new Date(this.fromDate);
    //     filterModel.fromDate = date.toLocaleDateString();
    //   }
    //   return this.recordService.getListReceived(filterModel);
    // };
    // this.list.hookToQuery(recieveStreamCreator).subscribe(response => {
    //   this.recieve = response;
    // });
  }

  onFileChange(event: any, index: number): void {
    this.selectedFiles[index] = event.target.files[0];

    if (this.selectedFiles[index]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.imageSrc[index] = e.target.result;
      };
      reader.readAsDataURL(this.selectedFiles[index]);
    } else {
      this.imageSrc[index] = '';
    }
  }

  onDetailNavChange($event: NgbNavChangeEvent) {
    if ($event.nextId === 2) {
      this.selectedStep = {};
      this.processData.selected = this.findItemById(
        this.processData.data,
        this.recordForm.get('processId').value as string,
      );
      this.showStepv2(this.processData.selected.id);
    }
  }

  buildRecordForm() {
    this.recordForm = this.fb.group({
      code: [this.selectedRecord.code || ''],
      companyProfileId: [this.selectedRecord.companyProfileId || ''],
      processId: [this.selectedRecord.processId || ''],
    });
  }

  buildDoneForm() {
    this.recordService.generateStartNumber().subscribe(res => {
      this.selectedLastTab.startNumber = res;
    });
  }

  transformOptionsForDisplay(options: any[]): any[] {
    return options.map(option => {
      return {
        id: option.id,
        name: option.optionValue,
      };
    });
  }

  getFieldData(selectedStepId, entityValue: any) {
    this.executorData.data = this.selectedStep.userTags;
    this.fieldData = [];

    const filterObj = {} as ProcessFieldFilterDto;
    filterObj.processStepId = selectedStepId;
    // this.recordService.getReception(selectedProcessId, selectedProcessId).subscribe(res => {
    //   this.selectedReception = res;
    // });
    this.entityValue = entityValue?.id;

    this.recordService
      .getStepResponseByTraceRecordIdAndProcessStepIdAndEntityValue(
        this.selectedRecord.id,
        selectedStepId,
        entityValue?.id,
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

  getReceptionData() {
    this.receptionData.data = [];
    this.recordService.getReception(this.selectedStep.id, this.selectedRecord.id).subscribe(res => {
      this.receptionData.data = res.items;
    });
  }

  getRecordShareData() {
    this.recordShareData.data = [];
    this.recordService
      .getRecordShared(this.selectedStep.id, this.selectedRecord.id)
      .subscribe(res => {
        this.recordShareData.data = res.items;
      });
  }

  getRecordWasSharedData() {
    this.receptionData.data = [];
    this.recordService.getRecordWasShared(this.selectedRecord.id).subscribe(res => {
      this.recordShareData.data = res.items;
    });
  }

  getProductData() {
    this.productData.data = [];
    this.productManageMentService.getProductDropdown().subscribe(res => {
      this.productData.data = res.items;
    });
  }

  getPartnerData() {
    this.partnerData.data = [];
    this.partnerService.getPartnerDropdown().subscribe(res => {
      this.partnerData.data = res.items;
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
      }),
    );
  }

  showStep(id: string) {
    const stepStreamCreator = query => {
      const filterModel = {} as ProcessStepFilterDto;
      filterModel.processId = id;
      filterModel.skipCount = 0;
      filterModel.maxResultCount = 1000;
      return this.processStepService.getListCustom(filterModel);
    };
    this.list.hookToQuery(stepStreamCreator).subscribe(response => {
      this.stepData = response.items;
      if (this.stepData && this.stepData.length > 0) {
      }
    });
  }

  showStepv2(id: string) {
    this.stepData = [];
    this.receptionData.data = [];
    this.fieldData = null;
    this.recordService.getStepDropdown(id).subscribe(steps => {
      this.stepData = steps.items;
    });
  }

  getDistrictData(provinceId: string) {
    this.districtData.data = [];
    return this.locationService.getDistrictDropdown(provinceId).pipe(
      tap(res => {
        this.districtData.data = res.items;
      }),
    );
  }

  createRecord() {
    this.recordService.generateRecordCode().subscribe(record => {
      this.selectedRecord = {} as TraceabilityRecordDto;
      this.selectedRecord.code = record;
      this.profileNameData.selected = '';
      this.processData.selected = '';

      this.buildRecordForm();
      this.isNewrecordModalOpen = true;
    });
  }

  filter($event: any) {
    this.list.get();
  }

  filterDateChange() {
    this.list.get();
  }

  editDone(id: string) {
    // this.recordService.get(id).subscribe(done => {
    //   this.selectedDone = done;
    //   this.profileNameData.selected = this.findItemById(
    //     this.profileNameData.data,
    //     done.profileName
    //   );
    //   this.processData.selected = this.findItemById(this.processData.data, done.processId);
    //   this.buildDoneForm();
    //   this.isDoneModalOpen = true;
    // });
  }

  recordingModalOpen(id: string) {
    this.defaultTabId = 2;
    this.recordService.get(id).subscribe(record => {
      this.selectedRecord = record;
      this.profileNameData.selected = this.findItemById(
        this.profileNameData.data,
        record.companyProfileId,
      );
      this.processData.selected = this.findItemById(this.processData.data, record.processId);
      this.buildRecordForm();
      this.showStepv2(this.processData.selected.id);
      this.selectStep(this.selectedRecord.currentStepId);

      this.isRecordModalOpen = true;
      this.isDetail = true;
    });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
  }

  delete(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.recordService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  // deleteDone(id) {
  //   this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
  //     if (status === Confirmation.Status.confirm) {
  //       this.recordService
  //         .delete(id)
  //         .pipe(
  //           catchError(error => {
  //             const errorMessage = error?.error?.message || 'Unknown error';
  //
  //             this.confirmation.error('::Error', errorMessage, options);
  //             throw error;
  //           })
  //         )
  //         .subscribe((success: boolean) => {
  //           if (success) {
  //             this.list.get();
  //           }
  //         });
  //     }
  //   });
  // }
  // deleteShare(id) {
  //   this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
  //     if (status === Confirmation.Status.confirm) {
  //       this.recordService
  //         .delete(id)
  //         .pipe(
  //           catchError(error => {
  //             const errorMessage = error?.error?.message || 'Unknown error';
  //
  //             this.confirmation.error('::Error', errorMessage, options);
  //             throw error;
  //           })
  //         )
  //         .subscribe((success: boolean) => {
  //           if (success) {
  //             this.list.get();
  //           }
  //         });
  //     }
  //   });
  // }
  // deleteRecieve(id) {
  //   this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
  //     if (status === Confirmation.Status.confirm) {
  //       this.recordService
  //         .delete(id)
  //         .pipe(
  //           catchError(error => {
  //             const errorMessage = error?.error?.message || 'Unknown error';
  //
  //             this.confirmation.error('::Error', errorMessage, options);
  //             throw error;
  //           })
  //         )
  //         .subscribe((success: boolean) => {
  //           if (success) {
  //             this.list.get();
  //           }
  //         });
  //     }
  //   });
  // }

  saveRecord() {
    if (!this.recordForm.valid) return;

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const currentDate: number = new Date().getTime();
      const dateString: string = currentDate.toString();

      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.uploadFile(this.selectedFiles[i], i);
      }

      // Do not append the file type here
      this.fieldData.result = [];
    } else {
      console.error('No files selected');
    }

    const { id } = this.selectedRecord || {};
    (id
      ? this.recordService.update(id, {
          ...this.selectedRecord,
          ...this.recordForm.value,
        })
      : this.recordService.create({ ...this.recordForm.value })
    )
      .pipe()
      .subscribe(() => {
        id ? (this.isRecordModalOpen = false) : (this.isNewrecordModalOpen = false);
        this.recordForm.reset();
        this.list.get();
      });
  }

  saveDone() {
    if (!this.doneForm.valid) return;
    // const { id } = this.selectedDone || {};
    // this.recordService
    //   .updateDone(id, {
    //     ...this.selectedDone,
    //     ...this.doneForm.value,
    //   })
    //
    //   .pipe()
    //   .subscribe(() => {
    //     this.isDoneModalOpen = false;
    //     this.doneForm.reset();
    //     this.list.get();
    //   });
  }

  // todo: multi language
  saveReception() {
    if (this.selectedStep.lotType === 1) {
      if (!this.selectedReception.traceabilityRecordSharedId) {
        this.toaster.error('::Record:ReceptionRequire');
        return;
      }
      this.currentSelection = {};
    }
    if (this.selectedStep.lotType === 5) {
      if (
        !this.currentSelection ||
        !this.currentSelection.country ||
        !this.currentSelection.province ||
        !this.currentSelection.district
      ) {
        this.toaster.error('::Record:OriginRequire');
        return;
      }
      this.selectedReception = {};
    }
    const input = {
      traceabilityRecordId: this.selectedRecord.id,
      processStepId: this.selectedStep.id,
      receptionType: this.selectedStep.lotType,
      traceabilityRecordSharedId: this.selectedReception.traceabilityRecordSharedId,
      countryId: this.currentSelection.country,
      provinceId: this.currentSelection.province,
      districtId: this.currentSelection.district,
    };
    this.recordService
      .saveReception(input)
      .pipe()
      .subscribe(res => {
        this.getReceptionData();
        this.currentSelection = {};
        const targetIds = ['countryTypehead', 'provinceTypehead', 'districtTypehead'];

        targetIds.forEach(targetId => {
          this.clearTypeheadById(targetId);
        });
      });
  }

  clearTypeheadById(targetId: string) {
    const targetTypehead = this.typeheadFocusComponents.find(
      component => component.id === targetId,
    );

    if (targetTypehead) {
      targetTypehead.clearTypeahead();
    }
  }

  saveRecordShare() {
    if (!this.selectedLastTab.endNumber || !this.selectedLastTab.productId) {
      this.toaster.error('::Record:ProductAndEndNumberRequire');
      return;
    }

    const input = {
      traceabilityRecordId: this.selectedRecord.id,
      productId: this.selectedLastTab.productId,
      // sourceTenantId: this.selectedRecord.tenantId,
      sharedTenantId: this.selectedRecord.companyProfileId,
      startNumber: this.selectedLastTab.startNumber,
      endNumber: this.selectedLastTab.endNumber,
      contractNumber: this.selectedLastTab.contractNumber,
      traceabilityCode: this.selectedRecord.code,
      status: 1,
    };
    this.recordService
      .saveRecordShareByInput(input)
      .pipe()
      .subscribe(res => {
        this.getRecordWasSharedData();
        this.selectedLastTab.endNumber = '';
        this.selectedLastTab.contractNumber = '';
        const targetIds = ['productTypehead', 'partnerTypehead'];

        targetIds.forEach(targetId => {
          this.clearTypeheadById(targetId);
        });
      });
  }

  validateEndNumber() {
    if (
      this.selectedLastTab.startNumber !== undefined &&
      this.selectedLastTab.endNumber !== undefined
    ) {
      if (this.selectedLastTab.endNumber < this.selectedLastTab.startNumber) {
        this.toaster.error('::Record:EndNumberValidate');
        return;
      }
    }
  }

  recordShareRowClick($event: any) {
    if ($event.type == 'click' && $event.row.id) {
      this.getFieldData(this.selectedStep.id, $event.row);
    }
  }

  saveRecordResponse(isDone: boolean) {
    if (this.selectedStep.isSpecial === 10) {
      //10 : step normal
      this.entityType = 0;
      this.entityValue = null;
    }

    if (this.selectedStep.isSpecial === 1) {
      //0 : first step
      this.entityType = 1;
    }
    if (this.selectedStep.isSpecial === 20) {
      //20 : last step
      this.entityType = 5;
    }
    const input = {} as CreateUpdateRecordResponseDto;
    input.traceabilityRecordId = this.selectedRecord.id;
    input.processStepId = this.selectedStep.id;
    input.entityType = this.entityType;
    input.entityValue = this.entityValue;
    input.processStepResponseId = this.processStepResponseId;
    input.fieldResponses = this.fieldData;
    input.isDone = isDone;
    let isError = false;
    input.fieldResponses.forEach(field => {
      if (field.dataType === 5) {
        const dateSelect = field.options[0].responseText;
        // if bug here, please check the responseText datatype in obj set string to any
        // field.options[0].responseText =
        //   dateSelect.year + '-' + dateSelect.month + '-' + dateSelect.day;
      }

      if (field.dataType === 4 && field.options[0].responseText) {
        const numberInput = field.options[0].responseText;
        field.options[0].responseText = numberInput.toString();
      }

      if (!field.executorId) {
        this.toaster.error('::Record:ExecutorRequire');
        isError = true;
      }
      field.options[0].selected = true;
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
          default:
            isError = false;
            break;
        }
      }
    });

    if (isError) {
      return;
    }
    this.recordService
      .saveRecordResponse(input)
      .pipe()
      .subscribe(res => {
        this.isRecordModalOpen = false;
        this.recordForm.reset();
        this.list.get();
      });
  }

  uploadFile(file: File, index: number): void {
    const formData: FormData = new FormData();
    formData.append('file', file);

    this.fileService.uploadFileByFile(formData).subscribe(res => {
      // Assuming res is an array of file results
      this.fieldData.result[index] = res;
    });
  }

  eventProfileFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterProfile = $event.data.id;
    } else {
      this.filterProfile = null;
    }
  }

  eventProcessFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterProcess = $event.data.id;
    } else {
      this.filterProcess = null;
    }
  }

  eventExecutorSelectHandle($event: any, field: any) {
    if ($event.success) {
      field.executorId = $event.data.id;
    }
  }

  eventProductSelectHandle($event: any) {
    if ($event.success) {
      this.selectedLastTab.productId = $event.data.id;
    }
  }

  eventPartnerSelectHandle($event: any) {
    if ($event.success) {
      this.selectedLastTab.partnerId = $event.data.id;
    }
  }

  eventReceptionSelectHandle($event: any) {
    if (this.selectedStep && $event.success) {
      this.selectedReception.traceabilityRecordSharedId = $event.data.id;
    }
  }

  eventCountrySelectHandle($event: any) {
    if ($event.success) {
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.currentSelection.country = $event.data.id;
    }
  }

  eventProvinceSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.currentSelection.province = $event.data.id;
    }
  }

  eventDistrictSelectHandle($event: any) {
    if ($event.success) {
      this.currentSelection.district = $event.data.id;
    }
  }

  getProfileNameData() {
    this.profileNameData.data = [];
    this.profileService.getDropdownList().subscribe(res => {
      this.profileNameData.data = res.items;
    });
  }

  eventProfileNameSelectHandle($event: any) {
    if ($event.success) {
      this.recordForm.patchValue({
        companyProfileId: $event.data.id,
      });
    }
  }

  getReceptionDropdown() {
    this.receptionDropdown.data = [];
    this.recordService
      .getReceptionDropdown(this.selectedStep.id, this.selectedRecord.id)
      .subscribe(res => {
        this.receptionDropdown.data = res.items;
      });
  }

  getProcessData() {
    this.processData.data = [];
    this.processService.getDropdownList().subscribe(res => {
      this.processData.data = res.items;
    });
  }

  eventProcessNameSelectHandle($event: any) {
    if ($event.success) {
      this.recordForm.patchValue({
        processId: $event.data.id,
      });
    }
  }

  selectStep(id: any) {
    this.processStepService.get(id).subscribe(step => {
      this.selectedStep = step;
      this.fieldData = [];
      this.receptionData = [];
      if (this.selectedStep.isSpecial === 1) {
        this.selectedStep.lotType = this.lotDropDown.data[0].id;
        this.selectedStep.lotTypeName = this.lotDropDown.data[0].name;
        this.getReceptionData();
      }
      if (this.selectedStep.isSpecial === 10) {
        this.getFieldData(this.selectedStep.id, null);
      }
      if (this.selectedStep.isSpecial === 20) {
        this.buildDoneForm();
        this.getRecordWasSharedData();
      }
      this.getReceptionDropdown();
    });
  }

  eventDropdownSelectHandle(field: any, selectedIndex: number) {
    field.options.forEach((option, index) => {
      option.selected = index === selectedIndex;
    });
  }

  selectedOptionsMap: Map<string, any[]> = new Map<string, any[]>();

  updateSelectedOptions(field: any, selectedValues: any[]) {
    this.selectedOptionsMap.set(field.processFieldId, selectedValues);

    field.options.forEach(option => {
      option.selected = selectedValues.includes(option.id);
    });
    this.cdr.detectChanges();
  }

  initializeSelectedOptions(field: any) {
    if (field.dataType === 2) {
      this.selectedOptionsMap.set(field.processFieldId, []);
      const selectedIds = field.options.filter(option => option.selected).map(option => option.id);
      this.selectedOptionsMap.set(field.processFieldId, selectedIds);
    }
    if (field.dataType === 5) {
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
  }

  eventLotSelectHandle(selectedValue: any) {
    this.selectedStep.lotType = selectedValue.id;
    this.selectedStep.lotTypeName = selectedValue.name;
  }

  getOptionsName(result: string | null): string {
    if (result !== null) {
      const matchingOption = this.fieldData
        .filter(field => Array.isArray(field.options))
        .flatMap(field => field.options)
        .find(option => (typeof option === 'object' ? option.id === result : option === result));

      return matchingOption
        ? typeof matchingOption === 'object'
          ? matchingOption.name
          : matchingOption
        : '';
    } else {
      return '';
    }
  }

  getSelectedOptionName(field: any): string {
    const selectedOption = field.options.find(option => option.selected === true);
    return selectedOption ? selectedOption.name : '';
  }

  getLotDropDownData() {
    this.lotDropDown.data = [
      {
        id: 1,
        name: 'Reception',
      },
      {
        id: 5,
        name: 'Origin',
      },
    ];
  }

  // todo: call delete data
  removeValue(value: string) {
    this.recordService.deleteReception(value).subscribe(res => {
      if (res) {
        if (
          this.selectedStep &&
          this.receptionData.data &&
          Array.isArray(this.receptionData.data)
        ) {
          this.receptionData.data = this.receptionData.data.filter(item => item.id !== value);
        }
        this.toaster.success('::Record:Delete:Success');
      }
    });
  }

  recordingSetDone(id) {
    this.recordService.setDone(id).subscribe(res => {
      if (res) {
        this.toaster.success('::Record:Done:Success');
        this.list.get();
      }
    });
  }

  viewTraceability(viewTraceabilityUrl: any) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/tv?d=' + viewTraceabilityUrl;
    window.location.href = fullLink;
  }
}
