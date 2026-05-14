import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { ProcessRoutingModule } from './process-routing.module';
import { ProcessComponent } from './process.component';
import { SharedModule } from '../shared/shared.module';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbInputDatepicker
} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ProcessComponent
  ],
  imports: [
    CommonModule,
    ProcessRoutingModule,
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
    NgxBootstrapMultiselectModule,
    DragDropModule,
    NgbDatepickerModule
  ]
})
export class ProcessModule { }
