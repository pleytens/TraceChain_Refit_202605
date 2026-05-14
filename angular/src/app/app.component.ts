import { Component } from '@angular/core';
import { UsersComponent } from './users/users.component';
import { eIdentityComponents } from '@abp/ng.identity/lib/enums/components';
import { ReplaceableComponentsService, RoutesService } from '@abp/ng.core';

@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar></abp-loader-bar>
    <abp-dynamic-layout></abp-dynamic-layout>
  `,
})
export class AppComponent {
  constructor(
    private replaceableComponentsService: ReplaceableComponentsService,
    private routes: RoutesService,
  ) {
    replaceableComponentsService.add({
      component: UsersComponent,
      key: eIdentityComponents.Users,
    });
  }
}
