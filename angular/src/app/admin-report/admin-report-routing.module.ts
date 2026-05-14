import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from '@abp/ng.core';
import { ReportTraceLocationComponent } from './report-trace-location/report-trace-location.component';
import { MapLocationReportComponent } from './map-location-report/map-location-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportTraceLocationComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'TraceFarm.ScanReports',
    },
  },

  {
    path: 'map-location',
    component: MapLocationReportComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'TraceFarm.ScanReports',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminReportRoutingModule {}
