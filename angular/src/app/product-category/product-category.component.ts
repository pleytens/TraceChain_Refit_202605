import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { ProductCategoryDto, ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Confirmation, ConfirmationService } from '@abp/ng.theme.shared';
import { RequestCustomDto } from '@proxy/traceverified/trace-farm/share';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss'],
  providers: [ListService]
})
export class ProductCategoryComponent implements OnInit{
  filterText: string = null;
  productCategory ={ items: [], totalCount: 0 } as PagedResultDto<ProductCategoryDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedProductCategory = {} as ProductCategoryDto;
  constructor(
    public readonly list: ListService,
    private productCategoryService: ProductCategoryService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    const productCategoryStreamCreator = (query) => {
      const filterModel = {} as RequestCustomDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      return this.productCategoryService.getListCustom(filterModel);
    };

    this.list.hookToQuery(productCategoryStreamCreator).subscribe((response) => {
      this.productCategory = response;
    });
  }

  createProductCategory() {
    this.selectedProductCategory = {} as ProductCategoryDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  filter($event: KeyboardEvent) {
    if ($event.key === 'Enter'){
      this.list.get();
    }
  }
  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedProductCategory.name || '', Validators.required]
    });
  }
  editProductCategory(id) {
    this.productCategoryService.get(id).subscribe((market) => {
      this.selectedProductCategory = market;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  deleteProductCategory(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.productCategoryService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const request = this.selectedProductCategory.id
      ? this.productCategoryService.update(this.selectedProductCategory.id, this.form.value)
      : this.productCategoryService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.list.get();
    });
  }
}
