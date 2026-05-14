import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicTemplateRoutingModule } from './public-template-routing.module';
import { PublicTemplateComponent } from './public-template.component';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
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
import { PageModule } from '@abp/ng.components/page';
import { SharedModule } from '../shared/shared.module';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormsModule } from '@angular/forms';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';

@NgModule({
  declarations: [PublicTemplateComponent],
  imports: [
    CommonModule,
    PublicTemplateRoutingModule,
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
    PageModule,
    TypeheadFocusComponent,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgbNavOutlet,
  ],
})
export class PublicTemplateModule {}
