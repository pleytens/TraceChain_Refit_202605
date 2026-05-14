import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreModule } from '@abp/ng.core';
import {
  IMultiSelectSettings,
  IMultiSelectTexts,
  NgxBootstrapMultiselectModule,
} from 'ngx-bootstrap-multiselect';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from '@abp/ng.theme.shared';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { EventCrudDto } from '@proxy/traceverified/trace-farm/events';
import { ConversionDateIsoService } from '../../../shared/components/date-picker/conversion-date-iso.service';
import { UploadComponent } from '../../../shared/components/upload-component/upload.component';
import { ImageStorageEnum } from '../../../shared/common/constant.variable.model';

@Component({
  selector: 'app-event-information',
  standalone: true,
  imports: [CoreModule, NgxBootstrapMultiselectModule, NgbInputDatepicker, UploadComponent],
  templateUrl: './event-information.component.html',
  styleUrl: './event-information.component.scss',
})
export class EventInformationComponent implements OnInit {
  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;
  eventInfoForm: FormGroup;
  eventModel: EventCrudDto;
  productData = [];
  imgName: string;
  singleSelectSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'form-control form-select text-start remove-arrow',
    containerClasses: 'w-100',
    itemClasses: 'text-center',
    selectionLimit: 1,
    autoUnselect: true,
    displayAllSelectedText: false,
  };
  MultiText: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Nothing found...',
    searchNoRenderText: 'Type in search box to see results...',
    defaultTitle: '',
    allSelected: 'All selected',
  };

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private productService: ProductService,
    private conversionDateService: ConversionDateIsoService,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.getProduct();
  }

  buildForm() {
    this.eventInfoForm = this.fb.group({
      coverImageName: [this.eventModel?.coverImageName || ''],
      code: [this.eventModel?.code || '', Validators.required],
      title: [this.eventModel?.title || '', Validators.required],
      productId: [[this.eventModel?.productId] || [], Validators.required],
      startDate: [
        this.conversionDateService.isoStringToNgDateStruct(this.eventModel?.startDate) || '',
      ],
      endDate: [
        this.conversionDateService.isoStringToNgDateStruct(this.eventModel?.endDate) || '',
        Validators.required,
      ],
    });
  }

  getProduct() {
    this.productService.getProductDropdown().subscribe(res => {
      this.productData = res.items;
    });
  }

  async submit() {
    if (this.uploadComponent) {
      const imageResponse = await this.uploadComponent.submitSingle();
      if (imageResponse) {
        this.eventInfoForm.patchValue({
          coverImageName: imageResponse,
        });
      }
    }

    if (this.eventInfoForm.invalid) {
      this.toasterService.error('::PleaseCheckRequiredField');
      return null;
    }

    const startDate = this.eventInfoForm.value.startDate;
    const endDate = this.eventInfoForm.value.endDate;
    return {
      ...this.eventInfoForm.value,
      productId: this.eventInfoForm.value.productId?.[0],
      startDate: this.conversionDateService.ngbDateStructToIsoString(startDate),
      endDate: this.conversionDateService.ngbDateStructToIsoString(endDate),
    };
  }

  protected readonly ImageStorageEnum = ImageStorageEnum;
}
