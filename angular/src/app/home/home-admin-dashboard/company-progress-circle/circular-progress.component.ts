import { Component, Input } from '@angular/core';
import { CoreModule } from '@abp/ng.core';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  templateUrl: './circular-progress.component.html',
  imports: [

    CoreModule
  ],
  styleUrls: ['./circular-progress.component.scss']
})
export class CircularProgressComponent {
  @Input() progress: number = 50;

  get rightBarTransform(): string {
    return this.progress <= 50
      ? `rotate(${(this.progress / 50) * 180}deg)`
      : 'rotate(180deg)';
  }

  get leftBarTransform(): string {
    return this.progress > 50
      ? `rotate(${((this.progress - 50) / 50) * 180}deg)`
      : 'rotate(0deg)';
  }
}
