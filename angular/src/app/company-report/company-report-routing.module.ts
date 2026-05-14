import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyReportComponent } from './company-report.component';

const routes: Routes = [{ path: '', component: CompanyReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyReportRoutingModule { }
