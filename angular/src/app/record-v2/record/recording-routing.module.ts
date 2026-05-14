import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordingComponent } from './recording.component';
import { AuthGuard, PermissionGuard } from '@abp/ng.core';

const routes: Routes = [
  {
    path: 'recording',
    component: RecordingComponent,
    canActivate: [AuthGuard, PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordingRoutingModule {}
