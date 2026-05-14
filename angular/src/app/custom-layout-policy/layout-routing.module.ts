import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { CustomLayoutComponentPolicy } from './custom-layout.component';

const routes: Routes = [{
  path: '',
  // component: CustomLayoutComponentPolicy,
  // // children: [
  // //   {
  // //     path: 'p',
  // //     loadChildren: () => import('../product-traceability/product-traceability.module').then(m => m.ProductTraceabilityModule)
  // //   }
  // // ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}
