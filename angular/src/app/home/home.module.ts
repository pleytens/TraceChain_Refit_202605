import { NgModule, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { RecordV2Module } from '../record-v2/record-v2.module';
import { ReportQrCodeShareComponent } from './report-qr-code-share/report-qr-code-share.component';
import { ChartModule } from '@abp/ng.components/chart.js';
import {
  ReportQrCodeSharePerCustomerComponent
} from './report-qr-code-share-per-customer/report-qr-code-share-per-customer.component';
import { TopRightComponent } from './top-right/top-right.component';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { GenQrCodeFormComponent } from './gen-qr-code-form/gen-qr-code-form.component';
import { LayoutsHomeModule } from './custom-home-layout/layouts.module';
import { ChartDemoComponent } from './home-admin-dashboard/number-of-company/number-of-company.component';
import {
  CircularProgressComponent,
} from './home-admin-dashboard/company-progress-circle/circular-progress.component';
import { PieChartComponent } from './home-admin-dashboard/pie-chart/pie-chart.component';
import { CompanyDashboardComponent } from './home-admin-dashboard/company-dashboard/company-dashboard.component';
import { ProductDashboardComponent } from './product-dashboard/product-dashboard.component';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from '@proxy/traceverified/trace-farm/dashboards';
import { TypeheadFocusCustomerComponent } from '../shared/components/typehead-focus-customer/app-typehead-focus';
import { HomeAdminDashboardComponent } from './home-admin-dashboard/home-admin-dashboard.component';


@NgModule({
  declarations: [HomeComponent, ReportQrCodeSharePerCustomerComponent, TopRightComponent, CompanyDashboardComponent, ProductDashboardComponent, HomeAdminDashboardComponent],
  imports: [SharedModule,
    HomeRoutingModule,
    RecordV2Module,
    ChartModule,
    ReportQrCodeShareComponent,
    GenQrCodeFormComponent,
    TypeheadFocusComponent,
    NgxBootstrapMultiselectModule, LayoutsHomeModule, ChartDemoComponent, CircularProgressComponent, PieChartComponent, NgbInputDatepicker, TypeheadFocusCustomerComponent],
  exports: [ReportQrCodeShareComponent],
})
export class HomeModule{
}
