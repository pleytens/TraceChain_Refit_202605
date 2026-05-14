import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { RecordRoutingModule } from './record-routing.module';
import { RecordComponent } from './record.component';
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
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavItemRole,
  NgbNavLink,
  NgbNavLinkBase,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';

@NgModule({
  declarations: [RecordComponent],
  imports: [
    CommonModule,
    RecordRoutingModule,
    NgbDatepickerModule,
    SharedModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbInputDatepicker,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ComboboxWithSearch,
    PageModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgbNavOutlet,
    NgxBootstrapMultiselectModule,
  ],
})
export class RecordModule {}
