import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordV2Component } from './record-v2.component';
import { AuthGuard, PermissionGuard } from '@abp/ng.core';

const routes: Routes = [
  {
    path: '',
    component: RecordV2Component,
    canActivate: [AuthGuard, PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordV2RoutingModule {}
