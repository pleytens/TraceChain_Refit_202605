import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicTemplateComponent } from './public-template.component';

const routes: Routes = [{ path: '', component: PublicTemplateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicTemplateRoutingModule { }
