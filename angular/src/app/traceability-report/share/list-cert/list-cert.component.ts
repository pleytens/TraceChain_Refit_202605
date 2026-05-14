import { Component, Input } from '@angular/core';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewImageModalComponent } from '../view-image-modal/view-image-modal.component';

@Component({
  selector: 'app-list-cert',
  standalone: true,
  imports: [NgForOf, NgOptimizedImage, NgIf],
  templateUrl: './list-cert.component.html',
  styleUrls: ['./list-cert.component.scss'],
})
export class ListCertComponent {
  @Input() listCert = [];

  constructor(private modalService: NgbModal) {}

  openImageModal(imgSrc: string) {
    const imgModalRef = this.modalService.open(ViewImageModalComponent, { size: 'md' });
    imgModalRef.componentInstance.imgSrc = imgSrc
  }
}
