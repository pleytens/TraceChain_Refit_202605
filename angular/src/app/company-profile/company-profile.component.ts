import { Component, OnInit, ViewChild } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CompanyProfileDto,
  CompanyProfileFilterDto,
  CompanyProfileService,
} from '@proxy/traceverified/trace-farm/companies';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';
import { MarketService } from '@proxy/traceverified/trace-farm/markets';
import { EditorComponent } from '../shared/components/editor/editor.component';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
})
export class CompanyProfileComponent implements OnInit {
  @ViewChild('editor') editor: EditorComponent;
  isCollapsed = true;
  filterText: string = null;
  profile = { items: [], totalCount: 0 } as PagedResultDto<CompanyProfileDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedProfile = {} as CompanyProfileDto;
  marketData: any = {};
  categoryData: any = {};
  filterMarket: any = {};
  filterCategory: any = {};
  selectedFiles: File[];
  certificationImages: any = [];
  modules: {};

  constructor(
    public readonly list: ListService,
    private profileService: CompanyProfileService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private fileService: StorageService,
    private productService: ProductCategoryService,
    private marketService: MarketService,
    private toasterService: ToasterService,
    private toastyService: ConfirmationService,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    this.getCategoryData();
    this.getMarketData();
    const profileStreamCreator = query => {
      const filterModel = {} as CompanyProfileFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterMarket) {
        filterModel.marketId = this.filterMarket.id;
      }
      if (this.filterCategory) {
        filterModel.productCategoryId = this.filterCategory.id;
      }

      return this.profileService.getListCustom(filterModel);
    };
    this.list.hookToQuery(profileStreamCreator).subscribe(response => {
      this.profile = response;
    });
  }

  createCompanyProfile() {
    this.selectedProfile = {} as CompanyProfileDto;
    this.marketData.selected = {};
    this.categoryData.selected = {};
    this.buildForm();
    this.isModalOpen = true;
  }

  filter() {
    this.list.get();
  }

  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedProfile.name || '', Validators.required],
      marketId: [this.selectedProfile.marketId || '', Validators.required],
      productCategoryId: [this.selectedProfile.productCategoryId || '', Validators.required],
      companyName: [this.selectedProfile.companyName || ''],
      description: [this.selectedProfile.description || ''],
      certificateImages: [this.selectedProfile.certificateImages || []],
    });
  }

  onFileChange(event: any): void {
    const files: File[] = Array.from(event.target.files);

    if (files.length > 5) {
      this.toastyService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      this.toasterService.error('::UnsupportedFormat', '::Error');
    }

    this.selectedFiles = imageFiles;

    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = e => {
        this.certificationImages.push(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.buildForm();
    this.isModalOpen = true;
  }

  edit(id: string) {
    this.profileService.get(id).subscribe(profile => {
      this.selectedProfile = profile;
      this.certificationImages = profile.certificateImagesBase64;
      this.buildForm();
      this.isModalOpen = true;
      this.categoryData.selected = this.findItemById(
        this.categoryData.data,
        profile.productCategoryId,
      );
      this.marketData.selected = this.findItemById(this.marketData.data, profile.marketId);
    });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
  }

  deleteCompanyProfile(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.profileService.delete(id).subscribe({
          next: () => {
            this.list.get();
            this.toasterService.success('::Delete:Success');
          },
        });
      }
    });
  }

  async save() {
    if (this.editor) {
      const description = await this.editor.uploadImagesFromQuillContent(this.editor.content);
      this.form.patchValue({
        description: description,
      });
    }
    if (!this.form.valid) return;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (const imageFile of this.selectedFiles) {
        const currentDate: number = new Date().getTime();
        // Convert the date to a string
        const fileName = currentDate.toString();
        const fileType = imageFile.name.split('.').pop();
        const certificationImageName = fileName + '.' + fileType;
        this.uploadFile(imageFile, certificationImageName);
        this.form.value.certificateImages.push(certificationImageName);
      }
      // Do not append the file type here
    } else {
      console.error('No file selected');
    }
    const { id } = this.selectedProfile || {};
    (id
      ? this.profileService.update(id, {
          ...this.selectedProfile,
          ...this.form.value,
        })
      : this.profileService.create({ ...this.form.value })
    )
      .pipe()
      .subscribe({
        next: () => {
          this.isModalOpen = false;
          this.selectedFiles = [];
          this.form.reset();
          this.list.get();
          this.toasterService.success('::Success');
        },
      });
  }

  uploadFile(file: File, fileName: string): void {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      this.form.value.logo = res;
    });
  }

  getMarketData() {
    this.marketData.data = [];
    this.marketService.getMarketDropdown().subscribe(res => {
      this.marketData.data = res.items;
    });
  }

  getCategoryData() {
    this.categoryData.data = [];
    this.productService.getProductCategoryDropdown().subscribe(res => {
      this.categoryData.data = res.items;
    });
  }

  eventMarketSelectHandle($event: any) {
    if ($event.success) {
      this.marketData.selected = $event.data;
      this.form.patchValue({
        marketId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        marketId: null,
      });
      this.marketData.selected = null;
    }
  }

  eventCategorySelectHandle($event: any) {
    if ($event.success) {
      this.categoryData.selected = $event.data;

      this.form.patchValue({
        productCategoryId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        productCategoryId: null,
      });
      this.categoryData.selected = null;
    }
  }

  eventMarketFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterMarket = $event.data;
      this.list.get();
    } else {
      this.filterMarket = null;
      this.list.get();
    }
  }

  eventCategoryFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterCategory = $event.data;
      this.list.get();
    } else {
      this.filterCategory = null;
      this.list.get();
    }
  }

  deleteImage(i: any) {
    this.certificationImages.splice(i, 1);
    this.selectedProfile.certificateImages.splice(i, 1);
  }

  filterChange() {
    this.list.get();
  }
}
