import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { catchError } from 'rxjs/operators';
import { IMultiSelectOption } from 'ngx-bootstrap-multiselect';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import {
  ProcessDto,
  ProcessService,
  ProcessStepDto,
  ProcessFilterDto,
  ProcessStepService,
  ProcessStepFilterDto,
  CreateUpdateProcessStepDto,
  ProcessFieldService,
  ProcessFieldFilterDto,
  ProcessFieldDto,
  CreateUpdateFieldOptionDto,
} from '@proxy/traceverified/trace-farm/process-managements';
import { UserService } from '../serviceCustom/test-service/user';
import { ReceptacleService } from '@proxy/traceverified/trace-farm/companies';
import { UserCustomService } from '@proxy/traceverified/trace-farm/account-managements';

const options: Partial<Confirmation.Options> = {
  hideCancelBtn: false,
  hideYesBtn: true,
  dismissible: false,
  cancelText: 'Cancle',
};

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
  providers: [ListService],
})
export class ProcessComponent implements OnInit {
  filterText: string = null;
  process = { items: [], totalCount: 0 } as PagedResultDto<ProcessDto>;
  step = { items: [], totalCount: 0 } as PagedResultDto<ProcessStepDto>;
  processForm: FormGroup;
  stepForm: FormGroup;
  isProcessModalOpen = false;
  isStepModalOpen = false;
  selectedProcess = {} as ProcessDto;
  selectedStep: ProcessStepDto = {} as ProcessStepDto;
  receptacleData: any = {};
  userData: any = {};
  userOptions: IMultiSelectOption[];
  showStepProcess = {} as ProcessDto;
  showStepTitle: string = '';
  isFieldModalOpen = false;
  fields: ProcessFieldDto[] = [];
  fieldForms: FormArray;
  selectedFile: File;
  imageSrc: string | ArrayBuffer = '';
  dataTypeData: any = {};
  idEditableCurrent: boolean = false;

  constructor(
    public readonly list: ListService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private userService: UserCustomService,
    private fileService: StorageService,
    private cdr: ChangeDetectorRef,
    private processApiService: ProcessService,
    private processStepService: ProcessStepService,
    private receptacleService: ReceptacleService,
    private processFieldService: ProcessFieldService,
    protected toasterService: ToasterService,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    this.getUserData();
    this.getDataType();
    this.getReceptacleData();
    const proccessStreamCreator = query => {
      const filterModel = {} as ProcessFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;

      return this.processApiService.getListCustom(filterModel);
    };
    this.list.hookToQuery(proccessStreamCreator).subscribe(response => {
      this.process = response;
    });
    this.fieldForms = this.fb.array([]);
  }

  buildProcessForm() {
    this.processForm = this.fb.group({
      // image: [this.selectedProcess. || ''],
      name: [this.selectedProcess.name || '', Validators.required],
      note: [this.selectedProcess.note || ''],
      logoImage: [this.selectedProcess.logoImage || null],
    });
  }

  buildStepForm() {
    this.stepForm = this.fb.group({
      name: [
        { value: this.selectedStep.name || '', disabled: this.idEditableCurrent },
        Validators.required,
      ],
      description: [
        { value: this.selectedStep.description || '', disabled: this.idEditableCurrent },
      ],
      // receptacleId: [this.selectedStep.receptacleId || '', Validators.required],
      userTags: [
        (this.selectedStep.userTags ? this.selectedStep.userTags.map(userTag => userTag.id) : []) ||
          [],
        Validators.required,
      ],
      processId: [this.showStepProcess.id],
    });
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // Read the selected file as a data URL
      const reader = new FileReader();
      reader.onload = e => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.imageSrc = '';
    }
  }

  showStep(id: string) {
    this.fields = [];
    this.processApiService.get(id).subscribe(process => {
      this.showStepProcess = process;
      const stepStreamCreator = query => {
        const filterModel = {} as ProcessStepFilterDto;
        filterModel.processId = id;
        filterModel.skipCount = query.skipCount;
        filterModel.maxResultCount = query.maxResultCount;
        return this.processStepService.getListCustom(filterModel);
      };
      this.list.hookToQuery(stepStreamCreator).subscribe(response => {
        this.step = response;
        this.showStepTitle = `${this.showStepProcess.name}`;
      });
    });
  }

  createProcess() {
    this.selectedProcess = {} as ProcessDto;

    this.buildProcessForm();
    this.isProcessModalOpen = true;
  }

  createStep() {
    this.selectedStep = {} as ProcessStepDto;
    this.receptacleData.data.selected = '';
    this.buildStepForm();
    this.isStepModalOpen = true;
  }

  filter($event: any) {
    this.list.get();
  }

  editProcess(id: string) {
    this.processApiService.get(id).subscribe(process => {
      this.selectedProcess = process;
      this.imageSrc = process.imageBase64;
      this.buildProcessForm();
      this.isProcessModalOpen = true;
    });
  }

  editStep(id: string) {
    this.processStepService.get(id).subscribe(step => {
      this.selectedStep = step;
      this.buildStepForm();
      this.isStepModalOpen = true;
      // this.receptacleData.selected = this.findItemById(this.receptacleData.data, step.receptacleId);
    });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
  }

  delete(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.processApiService
          .delete(id)
          .pipe(
            catchError(error => {
              this.confirmation.error('::Error', '', options);
              throw error;
            }),
          )
          .subscribe({
            next: () => {
              this.toasterService.success('::Process:Delete:Success');
              this.showStepProcess = {} as ProcessDto;
              this.step = { items: [], totalCount: 0 };
              this.list.get();
            },
          });
      }
    });
  }

  removeInputField(fieldId: string, optionId: string): void {
    const currentField = this.fields.find(field => field.id === fieldId);
    const option = currentField.options.find(option => option.id === optionId);
    currentField.options.splice(currentField.options.indexOf(option), 1);
  }

  deleteStep(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.processStepService
          .delete(id)
          .pipe(
            catchError(error => {
              this.confirmation.error('::Error', '', options);
              throw error;
            }),
          )
          .subscribe(() => {
            this.list.get();
            this.toasterService.success('::Step:Delete:Success');
            this.showStepProcess = {} as ProcessDto;
          });
      }
    });
  }

  saveProcess() {
    if (!this.processForm.valid) return;
    if (this.selectedFile) {
      const currentDate: number = new Date().getTime();
      // Convert the date to a string
      const fileName = currentDate.toString();
      const fileType = this.selectedFile.name.split('.').pop();
      const image = fileName + '.' + fileType;
      this.uploadFile(this.selectedFile, image);
      this.processForm.value.logoImage = image;
    } else {
      console.error('No file selected');
    }
    const { id } = this.selectedProcess || {};
    (id
      ? this.processApiService.update(id, {
          ...this.selectedProcess,
          ...this.processForm.value,
        })
      : this.processApiService.create({ ...this.processForm.value })
    )
      .pipe()
      .subscribe({
        next: () => {
          this.isProcessModalOpen = false;
          this.processForm.reset();
          this.list.get();
          this.toasterService.success('::Process:Success');
        },
      });
  }

  uploadFile(file: File, fileName: string): void {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      this.processForm.value.image = res;
    });
  }

  saveStep() {
    if (!this.stepForm.valid) return;
    const { id } = this.selectedStep || {};
    const userTags = this.stepForm.value.userTags || [];
    const userTagIds = userTags.filter(tag => !!tag).map(tag => tag);
    const stepDto: CreateUpdateProcessStepDto = {
      ...this.stepForm.value,
      userTagIds,
    };
    if (id) {
      this.processStepService
        .update(id, {
          ...this.selectedStep,
          ...stepDto,
        })
        .subscribe(() => {
          this.isStepModalOpen = false;
          this.stepForm.reset();
          this.list.get();
          this.toasterService.success('::Step:Update:Success');
        });
    } else {
      this.processStepService
        .getListCustom({
          processId: this.showStepProcess.id,
          maxResultCount: 1,
          skipCount: 0,
        })
        .subscribe(response => {
          const numberOfSteps = response.totalCount;

          stepDto.position = numberOfSteps + 1;
          this.processStepService.create(stepDto).subscribe({
            next: () => {
              this.isStepModalOpen = false;
              this.stepForm.reset();
              this.list.get();
              this.toasterService.success('::Step:Create:Success');
            },
          });
        });
    }
  }

  getReceptacleData() {
    this.receptacleData.data = [];
    this.receptacleService.getReceptacleDropdown().subscribe(res => {
      this.receptacleData.data = res.items;
    });
  }

  eventReceptacleSelectHandle($event: any) {
    if ($event.success) {
      this.stepForm.patchValue({
        receptacleId: $event.data.id,
      });
    }
  }

  getReceptacleName(receptacleId: string): string {
    return this.receptacleData.data?.find(item => item.id === receptacleId)?.name || '';
  }

  getUserData() {
    this.userData.data = [];
    this.userService.getUserDropdownItem2ByFilter(null).subscribe(res => {
      this.userData.data = res;
      this.userOptions = this.userData?.data?.items;
    });
  }

  getDataType() {
    this.processFieldService.getFieldDataType().subscribe(res => {
      this.dataTypeData.data = res.items;
    });
  }

  eventDataTypeSelectHandle(selectedValue: string, fieldId: string) {
    const selectedCard = this.fields.find(field => field.id === fieldId);
    selectedCard.dataType = parseInt(selectedValue);
  }

  getUserName(userId: string): string {
    return this.userData.data?.items.find(user => user.id === userId)?.name || '';
  }

  addField(id: string) {
    const filterObj = {} as ProcessFieldFilterDto;
    filterObj.processStepId = id;
    this.processFieldService.getListCustom(filterObj).subscribe(fields => {
      if (fields && fields.items.length > 0) {
        this.fields = fields.items;
      } else {
        this.fields = [
          {
            id: this.generateGUID(),
            stepId: id,
            name: '',
            dataType: null,
            isObligatory: false,
            position: 0,
            options: [{ optionValue: '', id: this.generateGUID() }],
          },
        ];
      }
      this.isFieldModalOpen = true;
    });
  }

  saveField() {
    let isError = false;

    this.fields.forEach(field => {
      if (field.dataType === 1 || field.dataType === 2) {
        const inputOptionCheck = field.options.some(option => option.optionValue === '');
        if (inputOptionCheck) {
          this.toasterService.error('::Field:InputRequire');
          isError = true;
        }
      }
      if (field.name === '') {
        this.toasterService.error('::Field:NameRequire');
        isError = true;
      }
    });
    if (isError) {
      return;
    }
    const fieldUpdateList = this.fields.map((field, index) => {
      const fieldDto: CreateUpdateFieldOptionDto = {
        id: field.id,
        stepId: field.stepId,
        name: field.name,
        dataType: field.dataType,
        isObligatory: field.isObligatory,
        position: index,
        options: field.options,
      };
      return fieldDto;
    });
    this.processFieldService.updateList(fieldUpdateList).subscribe(() => {
      this.isFieldModalOpen = false;
      this.showStep(this.showStepProcess.id);
      this.toasterService.success('::Field:Success');
    });
  }

  addCard(stepId: string) {
    const newCard: ProcessFieldDto = {
      id: this.generateGUID(),
      stepId,
      name: '',
      dataType: 1,
      position: 0,
      isObligatory: false,
      options: [{ optionValue: '', id: this.generateGUID() }],
    };
    this.fields.push(newCard);
  }

  duplicateCard(index: string) {
    const selectedCard = this.fields.find(field => field.id === index);
    const newCard = JSON.parse(JSON.stringify(selectedCard));
    newCard.id = this.generateGUID();
    const options = newCard.options.forEach(option => {
      option.id = this.generateGUID();
      option.optionValue;
    });
    this.fields.push(newCard);
  }

  deleteCard(index: number, fieldId: string) {
    this.processFieldService.delete(fieldId).subscribe(() => {
      this.fields.splice(index, 1);

      this.toasterService.success('::Field:Delete:Success');
    });
  }

  drop(event: CdkDragDrop<FormArray>): void {
    const draggedItem = this.fields[event.currentIndex];
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }

  processRowClick($event: any) {
    if ($event.type == 'click' && $event.row.id) {
      this.idEditableCurrent = $event.row.idEditable;
      this.showStep($event.row.id);
    }
  }

  getDataTypeName(dataTypeId: number): string {
    return this.dataTypeData.data?.find(data => data.id === dataTypeId)?.name || '';
  }

  generateGUID(): string {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  addOptionField(id: string) {
    const selectedCard = this.fields.find(field => field.id === id);
    selectedCard.options.push({ optionValue: '', id: this.generateGUID() });
  }

  addFirstStep(stepId: string, processId: string) {
    this.processStepService.setFirstStep(processId, stepId).subscribe(result => {
      if (result) {
        this.showStep(this.showStepProcess.id);
        this.toasterService.success('::Success');
      } else {
        this.toasterService.error('::Error');
      }
    });
  }

  addLastStep(stepId: string, processId: string) {
    this.processStepService.setLastStep(processId, stepId).subscribe(result => {
      if (result) {
        this.showStep(this.showStepProcess.id);
        this.toasterService.success('::Success');
      } else {
        this.toasterService.error('::Error');
      }
    });
  }

  deleteImage() {
    this.imageSrc = null;
    this.selectedFile = null;
    this.processForm.value.logoImage = null;
  }

  moveUp(step: any) {
    if (step.position === 1 || step.position == this.step.totalCount) {
      return;
    }

    const currentPosition = step.position - 1;

    this.moveItem(this.step.items, currentPosition, currentPosition - 1);

    console.table(this.step.items);
    this.processStepService.updateMultipleStep(this.step.items).subscribe(result => {
      if (result) {
        this.showStep(this.showStepProcess.id);
        this.toasterService.success('::Success');
      } else {
        this.toasterService.error('::Error');
      }
    });
  }

  moveItem(array: any[], fromIndex: number, toIndex: number): void {
    const item = array.splice(fromIndex, 1)[0]; // Remove the item from the original position
    array.splice(toIndex, 0, item); // Insert the item at the new position
    array.forEach((step, index) => {
      step.position = index + 1;
    });
  }

  moveDown(step: any) {
    if (step.position === 1 || step.position == this.step.totalCount) {
      return;
    }

    const currentPosition = step.position - 1;

    this.moveItem(this.step.items, currentPosition, currentPosition + 1);
    // this.step.items.forEach((step, index) => {
    //   step.position = index + 1;
    // });
    this.processStepService.updateMultipleStep(this.step.items).subscribe(result => {
      if (result) {
        this.showStep(this.showStepProcess.id);
        this.toasterService.success('::Success');
      } else {
        this.toasterService.error('::Error');
      }
    });
  }
}
