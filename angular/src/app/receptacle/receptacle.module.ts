import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReceptacleRoutingModule } from './receptacle-routing.module';
import { ReceptacleComponent } from './receptacle.component';
import { SharedModule } from '../shared/shared.module';

import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PageModule } from '@abp/ng.components/page';
import { NgxValidateCoreModule } from '@ngx-validate/core';

@NgModule({
  declarations: [
    ReceptacleComponent
  ],
  imports: [
    CommonModule,
    ReceptacleRoutingModule,
    SharedModule,
    BaseCoreModule,
    LocalizationModule,
    BaseThemeSharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    PageModule,
    NgxValidateCoreModule
  ]
})
export class ReceptacleModule { }
