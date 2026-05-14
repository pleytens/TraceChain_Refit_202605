import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductCategoryRoutingModule } from './product-category-routing.module';
import { ProductCategoryComponent } from './product-category.component';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { FormsModule } from '@angular/forms';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
  declarations: [
    ProductCategoryComponent
  ],
  imports: [
    CommonModule,
    ProductCategoryRoutingModule,
    BaseCoreModule,
    FormsModule,
    LocalizationModule,
    BaseThemeSharedModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgxDatatableModule
  ]
})
export class ProductCategoryModule { }
