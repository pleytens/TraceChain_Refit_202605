import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { RecordingRoutingModule } from './recording-routing.module';
import { RecordingComponent } from './recording.component';
import { SharedModule } from '../../shared/shared.module';
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
import { ComboboxWithSearch } from '../../shared/components/typeahead/combobox-with-search';
import { PageModule } from '@abp/ng.components/page';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import { TypeheadFocusCustom } from 'src/app/shared/components/typehead-focus-custom/app-typehead-focus';
import { ViewFilesComponent } from 'src/app/shared/components/view-files/view-files.component';
@NgModule({
  declarations: [RecordingComponent],
  imports: [
    CommonModule,
    RecordingRoutingModule,
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
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgbNavOutlet,
    NgxDatatableModule,
    NgxValidateCoreModule,
    ComboboxWithSearch,
    PageModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    NgxBootstrapMultiselectModule,
    TypeheadFocusCustom,
    ViewFilesComponent,
  ],
})
export class RecordingModule {}
