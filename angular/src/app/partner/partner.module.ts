import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PartnerRoutingModule } from './partner-routing.module';
import { PartnerComponent } from './partner.component';
import { SharedModule } from '../shared/shared.module';

import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeheadFocusCustomerComponent } from '../shared/components/typehead-focus-customer/app-typehead-focus';
@NgModule({
  declarations: [PartnerComponent],
  imports: [
    CommonModule,
    PartnerRoutingModule,
    SharedModule,
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
    TypeheadFocusComponent,
    NgbCollapseModule,
    TypeheadFocusCustomerComponent,
  ],
})
export class PartnerModule {}
