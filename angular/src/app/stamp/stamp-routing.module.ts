import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StampComponent } from './stamp.component';

const routes: Routes = [{ path: '', component: StampComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StampRoutingModule { }
