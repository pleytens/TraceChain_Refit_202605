import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { RecordV2RoutingModule } from './record-v2-routing.module';
import { RecordV2Component } from './record-v2.component';
import { SharedModule } from '../shared/shared.module';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { ComboboxWithSearch } from '../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';

import { RecordingModule } from './record/recording.module';
@NgModule({
  declarations: [RecordV2Component],
  imports: [
    CommonModule,
    RecordV2RoutingModule,
    NgbDatepickerModule,
    SharedModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    FormsModule,
    ReactiveFormsModule,
    RecordingModule,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ComboboxWithSearch,
    PageModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    NgxBootstrapMultiselectModule
  ],
  exports: [
    RecordV2Component
  ]
})
export class RecordV2Module {}
