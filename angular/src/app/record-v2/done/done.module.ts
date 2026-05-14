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
import { DoneComponent } from './done.component';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DoneRoutingModule } from './done-routing.module';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
@NgModule({
  declarations: [DoneComponent],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    TypeheadFocusComponent,
    NgbCollapseModule,
    DoneRoutingModule,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgxBootstrapMultiselectModule,
  ],
})
export class DoneModule {}
