import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLayoutComponent } from './custom-layout/custom-layout.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@abp/ng.core';

@NgModule({
  declarations: [CustomLayoutComponent],
  imports: [CommonModule, RouterModule, CoreModule],
  exports: [CustomLayoutComponent],
})
export class LayoutsModule {}
