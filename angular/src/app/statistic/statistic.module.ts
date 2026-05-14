import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticRoutingModule } from './statistic-routing.module';
import { StatisticComponent } from './statistic.component';
import {
  NgbDatepickerModule,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { SharedRoutingModule } from '../record-v2/shared/shared-routing.module';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
@NgModule({
  declarations: [StatisticComponent],
  imports: [
    CommonModule,
    StatisticRoutingModule,
    NgbDatepickerModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    NgxBootstrapMultiselectModule,
    SharedRoutingModule,
    TypeheadFocusComponent,
  ],
})
export class StastisticModule {}
