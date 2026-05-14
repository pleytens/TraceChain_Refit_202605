import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomHomeLayoutComponent } from './custom-home-layout.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@abp/ng.core';
import { LanguageComponent } from '../../shared/components/language/language.component';
import { HomeFreeRoutingModule } from './home-free-routing.module';

@NgModule({
  declarations: [CustomHomeLayoutComponent],
  imports: [CommonModule, RouterModule, CoreModule, LanguageComponent, HomeFreeRoutingModule],
  exports: [CustomHomeLayoutComponent],
})
export class  LayoutsHomeModule {}
