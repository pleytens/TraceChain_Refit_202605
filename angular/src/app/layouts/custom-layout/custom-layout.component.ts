import { Component } from '@angular/core';
import { CoreModule } from '@abp/ng.core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-custom-layout',
  templateUrl: './custom-layout.component.html',
  styleUrls: ['./custom-layout.component.scss'],
  standalone: true,
 imports: [CoreModule, RouterModule]
})

export class CustomLayoutComponent {
}
