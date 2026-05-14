import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CustomLayoutComponentPolicy } from './custom-layout.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@abp/ng.core';
import { LanguageComponent } from '../shared/components/language/language.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { LanguageGoogleComponent } from '../shared/components/language-google/language-google.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, CoreModule,  LanguageComponent, LayoutRoutingModule, LanguageGoogleComponent],
  exports: [],
})
export class  LayoutsPolicyModule {}
