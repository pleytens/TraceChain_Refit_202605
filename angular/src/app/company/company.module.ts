import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbInputDatepicker, NgbNav, NgbNavContent, NgbNavItem, NgbNavItemRole, NgbNavLink, NgbNavLinkBase, NgbNavOutlet
} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { BaseUiExtensionsModule } from '@abp/ng.theme.shared/extensions';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';


@NgModule({
  declarations: [CompanyComponent],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    BaseCoreModule,
    BaseThemeSharedModule,
    ComboboxWithSearch,
    LocalizationModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbInputDatepicker,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ReactiveFormsModule,
    SharedModule,
    BaseUiExtensionsModule,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgbNavOutlet,
    TypeheadFocusComponent,
    NgOptimizedImage,
  ],
  exports: [CompanyComponent],
})
export class CompanyModule {}
