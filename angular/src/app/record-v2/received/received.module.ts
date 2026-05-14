import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { ReceivedComponent } from './received.component';
import { ReceivedRoutingModule } from './received-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';

@NgModule({
  declarations: [ReceivedComponent],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    ReceivedRoutingModule,
    NgbCollapseModule,
    TypeheadFocusComponent,
    SharedModule,
    NgxBootstrapMultiselectModule,
  ],
})
export class ReceivedModule {}
