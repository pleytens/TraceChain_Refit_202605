import { LocalizationModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  NgbActiveModal,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLinkBase,
  NgbNavLinkButton,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { RandomSelectionComponent } from './random-selection/random-selection.component';
import { EventService } from '@proxy/traceverified/trace-farm/events';
import { SurveyInstance4ShowDto } from '@proxy/traceverified/trace-farm/events/surveys';

@Component({
  selector: 'app-event-random-modal',
  standalone: true,
  imports: [
    CommonModule,
    LocalizationModule,
    NgbNav,
    NgbNavContent,
    NgbNavLinkBase,
    NgbNavLinkButton,
    NgbNavItem,
    NgbNavOutlet,
    ParticipantListComponent,
    RandomSelectionComponent,
  ],
  templateUrl: './event-random-modal.component.html',
  styleUrl: './event-random-modal.component.scss',
})
export class EventRandomModalComponent {
  activeId: number;
  eventId: string;
  listSelectedInstance: SurveyInstance4ShowDto[]

  private activeModal = inject(NgbActiveModal);
  private eventService = inject(EventService);
  constructor() {}

  dismissModal(): void {
    this.activeModal.dismiss();
  }

  onInstanceSelected(selectedInstances: SurveyInstance4ShowDto[]) {
    this.listSelectedInstance = selectedInstances;
  }
}
