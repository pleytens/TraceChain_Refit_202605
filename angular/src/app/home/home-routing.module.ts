import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { HomeAdminDashboardComponent } from './home-admin-dashboard/home-admin-dashboard.component';
import { AuthGuard, PermissionGuard } from '@abp/ng.core';

const routes: Routes = [{ path: '', component: HomeComponent }, {
  path: 'admin-home', component: HomeAdminDashboardComponent,
  canActivate: [AuthGuard, PermissionGuard]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}

