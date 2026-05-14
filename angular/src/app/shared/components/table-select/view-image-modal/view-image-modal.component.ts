import { Component } from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {LocalizationModule} from "@abp/ng.core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-view-image-modal',
  standalone: true,
    imports: [
        NgForOf,
        NgIf,
        LocalizationModule,
        NgOptimizedImage
    ],
  templateUrl: './view-image-modal.component.html',
  styleUrl: './view-image-modal.component.scss'
})
export class ViewImageModalComponent {
  imgSrc = []
  constructor(
      private activeModal: NgbActiveModal
  ) {
  }

  dismissModal() {
    this.activeModal.dismiss()
  }
}
