import { Component } from '@angular/core';
import { LocalizationModule } from '@abp/ng.core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-view-image-modal',
  standalone: true,
  imports: [LocalizationModule, NgOptimizedImage],
  templateUrl: './view-image-modal.component.html',
  styleUrl: './view-image-modal.component.scss',
})
export class ViewImageModalComponent {
  imgSrc: string;

  constructor(private activeModal: NgbActiveModal) {}
  closeModal() {
    this.activeModal.close();
  }
}
