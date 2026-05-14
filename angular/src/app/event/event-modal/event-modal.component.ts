import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalizationModule } from '@abp/ng.core';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EventInformationComponent } from './event-information/event-information.component';
import { EventQuestionsComponent } from './event-questions/event-questions.component';
import { EventService, EventCrudDto } from '@proxy/traceverified/trace-farm/events';
import { ToasterService } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [LocalizationModule, NgbNavModule, EventInformationComponent, EventQuestionsComponent],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.scss',
})
export class EventModalComponent implements OnInit {
  @ViewChild('eventInfoComponent')
  eventInformationComponent: EventInformationComponent;
  @ViewChild('eventQuestionsComponent')
  eventQuestionsComponent: EventQuestionsComponent;
  eventId: string;
  eventModel: EventCrudDto;
  active = 1;
  constructor(
    private activeModal: NgbActiveModal,
    private eventService: EventService,
    private toasterService: ToasterService,
  ) {}

  ngOnInit() {
    if (this.eventId) {
      this.getEventDetail(this.eventId);
    }
  }

  getEventDetail(eventId: string) {
    this.eventService.getEventWithQuestions(eventId).subscribe({
      next: res => {
        this.eventInformationComponent.eventModel = res;
        this.eventInformationComponent.buildForm();
        this.eventInformationComponent.imgName = res.coverImageName;
        this.eventQuestionsComponent.questionList = res.questions;
      },
    });
  }

  async save() {
    if (!this.eventInformationComponent) return;
    if (!this.eventQuestionsComponent) return;
    let eventInfo: EventCrudDto;
    let eventQuestions = this.eventQuestionsComponent.submit();
    const eventInfoData = await this.eventInformationComponent.submit();
    if (eventInfoData) {
      eventInfo = { ...eventInfoData };
    } else {
      return;
    }

    if (eventQuestions) {
      eventInfo = {
        ...eventInfo,
        questions: eventQuestions,
      };
    } else {
      return;
    }

    const request = this.eventId
      ? this.eventService.updateWithQuestion(this.eventId, eventInfo)
      : this.eventService.createWithQuestion(eventInfo);

    request.subscribe({
      complete: () => {
        this.toasterService.success(
          this.eventId ? '::Event:UpdateSuccess' : '::Event:CreateSuccess',
          '::Success',
        );
        this.activeModal.close();
      },
      error: err => {
        this.toasterService.error(err, '::Error');
      },
    });
  }

  dismissModal() {
    this.activeModal.dismiss();
  }
}
