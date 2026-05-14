import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { TemplateDto, TemplateFilterDto } from 'src/app/serviceCustom/test-service/public-template';
import {
  ReportTemplateDto,
  ReportTemplateService,
} from '@proxy/traceverified/trace-farm/report-templates';
import { ProcessService } from '@proxy/traceverified/trace-farm/process-managements';
@Component({
  selector: 'app-public-template',
  templateUrl: './public-template.component.html',
  styleUrls: ['./public-template.component.scss'],
  providers: [ListService],
})
export class PublicTemplateComponent implements OnInit {
  filterText: string = null;
  publicTemplate = { items: [], totalCount: 0 } as PagedResultDto<ReportTemplateDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedPublicTemplate = {} as ReportTemplateDto;
  userTypeData: any = {};
  processData: any = {};
  selectedProduct: any = {};
  stepData: any = [];
  selectAllChecked = false;

  constructor(
    public readonly list: ListService,
    private reportTemplateService: ReportTemplateService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private processService: ProcessService,
    private toaster: ToasterService,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getUserTypeData();
    const publicTemplateStreamCreator = query => {
      const filterModel = {} as TemplateFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;

      return this.reportTemplateService.getListCustom(filterModel);
    };
    this.list.hookToQuery(publicTemplateStreamCreator).subscribe(response => {
      this.publicTemplate = response;
    });
  }

  createTemplate() {
    this.selectedPublicTemplate = {} as ReportTemplateDto;
    this.getProductDropdown();
    this.userTypeData.selected = {};
    this.buildForm();

    this.isModalOpen = true;
  }

  filter($event: any) {
    this.list.get();
  }

  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedPublicTemplate.name || '', Validators.required],
      userType: [this.selectedPublicTemplate.userType || '', Validators.required],
      allowShowFrontNode: [this.selectedPublicTemplate.allowShowFrontNode || false],
      allowShowFullInfo: [this.selectedPublicTemplate.allowShowFullInfo || false],
      allowOnlyArea: [this.selectedPublicTemplate.allowOnlyArea || false],
      allowShowFollowNode: [this.selectedPublicTemplate.allowShowFollowNode || false],
      allowShowLink: [this.selectedPublicTemplate.allowShowLink || false],
    });
  }

  openModal() {
    this.buildForm();
    this.getProductDropdown();
    this.isModalOpen = true;
  }

  edit(id: string) {
    this.selectedProduct = this.processData[0];
    this.getProductDropdown();
    this.reportTemplateService.get(id).subscribe(template => {
      this.selectedPublicTemplate = template;
      this.openModal();
      this.userTypeData.selected = this.findItemById(this.userTypeData.data, template.userType);
    });
  }

  findItemById(data: any[], id: number): any {
    return data.find(item => item.id === id);
  }

  deleteTemplate(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.reportTemplateService.delete(id).subscribe(() => {
          this.list.get();
          this.toaster.success('::Delete:Success');
        });
      }
    });
  }

  save() {
    if (!this.form.valid) return;
    const input = {
      ...this.selectedPublicTemplate,
      ...this.form.value,
      details: this.stepData,
    };
    const { id } = this.selectedPublicTemplate || {};
    (id ? this.reportTemplateService.update(id, input) : this.reportTemplateService.create(input))
      .pipe()
      .subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
        this.toaster.success('::Success');
      });
  }

  getUserTypeData() {
    this.userTypeData.data = [];
    this.reportTemplateService.getUserTypeDropdown().subscribe(res => {
      this.userTypeData.data = res.items;
    });
  }

  getProductDropdown() {
    this.processService.getDropdownList().subscribe(res => {
      this.processData = res.items;
      this.onChangeData(res.items[0]);
    });
  }

  eventUserTypeSelectHandle($event: any) {
    if ($event.success) {
      this.form.patchValue({
        userType: $event.data.id,
      });
      this.userTypeData.selected = this.findItemById(this.userTypeData.data, $event.data.id);
    } else {
      this.form.patchValue({
        userType: null,
      });
      this.userTypeData.selected = null;
    }
  }

  onChangeData(data) {
    this.selectAllChecked = false;
    this.selectedProduct = data;
    this.reportTemplateService
      .getStepAndFieldByReportTemplateIdAndProcessId(this.selectedPublicTemplate.id, data.id)
      .subscribe(res => {
        this.stepData = res.items;
        if (this.stepData.every(step => step.isChecked)) {
          this.selectAllChecked = true;
        }
      });
  }

  onClickSelectThisTab() {
    this.selectAllChecked = !this.selectAllChecked;

    this.stepData.forEach(element => {
      element.isChecked = this.selectAllChecked;
      element.fields.forEach(field => {
        field.isChecked = this.selectAllChecked;
      });
    });
  }

  getChecked(name): boolean {
    return true;
  }

  onCheckboxChange(stepId: any, fieldId: string) {
    this.stepData.forEach((element, index) => {
      if (element.id === stepId) {
        element.fields.forEach((field, index) => {
          if (field.id === fieldId) {
            field.isChecked = !field.isChecked;
          }
          if (element.isChecked && !field.isChecked) {
            element.isChecked = !element.isChecked;
          }
        });
      }
    });
  }

  onTemplateCheckboxChange(stepId: any) {
    this.stepData.forEach(element => {
      if (element.id === stepId) {
        element.isChecked = !element.isChecked;
        element.fields.forEach(field => {
          field.isChecked = element.isChecked;
        });
      }
    });
  }

  updateFormControl(controlName: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.get(controlName).setValue(checked);
  }

  allowShowFrontNodeCheck() {
    if (!this.form.get('allowShowFrontNode').value) {
      this.form.get('allowShowFullInfo').setValue(false);
      this.form.get('allowOnlyArea').setValue(false);
    }
  }
}
