import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminReportRoutingModule } from './admin-report-routing.module';
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
import { ReportTraceLocationComponent } from './report-trace-location/report-trace-location.component';
import { GtinCodeReportComponent } from './gtin-code-report/gtin-code-report.component';

@NgModule({
  declarations: [ReportTraceLocationComponent],
  imports: [
    CommonModule,
    AdminReportRoutingModule,
    NgbDatepickerModule,
    SharedModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    FormsModule,
    ReactiveFormsModule,
    AdminReportRoutingModule,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ComboboxWithSearch,
    PageModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    NgxBootstrapMultiselectModule,
    GtinCodeReportComponent,
  ],
  exports: [ReportTraceLocationComponent],
})
export class AdminReportModule {}
