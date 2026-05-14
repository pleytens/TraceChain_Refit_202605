import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceptacleComponent } from './receptacle.component';

const routes: Routes = [{ path: '', component: ReceptacleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceptacleRoutingModule { }
