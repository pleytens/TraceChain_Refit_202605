import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductTraceabilityComponent } from './product-traceability/product-traceability.component';

const routes: Routes = [
  {
    path: '',
    component: ProductTraceabilityComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductTraceabilityRoutingModule { }
