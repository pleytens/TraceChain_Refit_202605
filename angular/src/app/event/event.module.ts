import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event.component';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { CoreModule, LocalizationModule } from '@abp/ng.core';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownMenu,
  NgbDropdownModule,
  NgbDropdownToggle
} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [EventComponent],
  imports: [
    CommonModule,
    EventRoutingModule,
    BaseThemeSharedModule,
    LocalizationModule,
    CoreModule,
    NgbDropdownModule

  ],
})
export class EventModule {}
