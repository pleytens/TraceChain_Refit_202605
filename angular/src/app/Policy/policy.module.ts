import { NgModule } from '@angular/core';
import { LayoutsPolicyModule } from '../custom-layout-policy/layouts.module';
import { PolicyComponent } from './policy.component';
import { PolicyRoutingModule } from './policy-routing.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  declarations: [PolicyComponent],
  imports: [PolicyRoutingModule, LayoutsPolicyModule, SharedModule],
})
export class PolicyModule {}
