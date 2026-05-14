import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbDatepickerModule,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { SharedComponent } from './shared.component';

import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { SharedRoutingModule } from './shared-routing.module';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
@NgModule({
  declarations: [SharedComponent],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    SharedRoutingModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgxBootstrapMultiselectModule,
  ],
})
export class SharedModule {}
