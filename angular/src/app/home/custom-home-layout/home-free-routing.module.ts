import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomHomeLayoutComponent } from './custom-home-layout.component';
import { GenQrCodeFormComponent } from '../gen-qr-code-form/gen-qr-code-form.component';

const routes: Routes = [{
    path: '',
      component: CustomHomeLayoutComponent,
    children: [
      {
        path: '',
        component: GenQrCodeFormComponent
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeFreeRoutingModule {}
