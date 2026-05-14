import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';

import { SharedModule } from '../shared/shared.module';

import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbInputDatepicker,NgbNav, NgbNavContent, NgbNavItem, NgbNavItemRole, NgbNavLink, NgbNavLinkBase, NgbNavOutlet
} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill'
import { EditorComponent } from '../shared/components/editor/editor.component';

@NgModule({
  declarations: [ProductComponent],
  imports: [
    CommonModule,
    ProductRoutingModule,
    SharedModule,
    NgbDatepickerModule,
    BaseCoreModule,
    BaseThemeSharedModule,
    FormsModule,
    LocalizationModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ReactiveFormsModule,
    NgbInputDatepicker,
    ComboboxWithSearch,
    PageModule,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgbNavOutlet,
    TypeheadFocusComponent,
    NgbCollapseModule,
    QuillModule.forRoot(),
    EditorComponent,
  ],
})
export class ProductModule {}
