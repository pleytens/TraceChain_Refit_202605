import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import {TraceabilityReportComponent} from "./traceability-report.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: 't',
        component: TraceabilityReportComponent
      },

      {
        path: 'p',
        component: TraceabilityReportComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TraceabilityReportRoutingModule {}
