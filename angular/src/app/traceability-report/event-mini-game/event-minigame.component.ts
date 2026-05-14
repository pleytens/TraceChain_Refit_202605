import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CoreModule, LocalizationModule } from '@abp/ng.core';
import { EventDto, EventService } from '@proxy/traceverified/trace-farm/events';
import { ActivatedRoute } from '@angular/router';
import { MinigameQuestionComponent } from './minigame-question/minigame-question.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadComponent } from '../../shared/components/upload-component/upload.component';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { ToasterService } from '@abp/ng.theme.shared';
import { MiniGameDto } from '@proxy/traceverified/trace-farm/events/surveys';

@Component({
  selector: 'app-event-mini-game',
  standalone: true,
  imports: [LocalizationModule, MinigameQuestionComponent, CoreModule, UploadComponent],
  templateUrl: './event-minigame.component.html',
  styleUrl: './event-minigame.component.scss',
})
export class EventMinigameComponent implements OnInit, OnChanges {
  @Input() productId: string;
  gtinCode: string;
  @ViewChild('userInfoModal') userInfoModal: any;
  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;
  @ViewChild('completedModal') completedModal!: any;
  event: EventDto;
  questionList: MiniGameDto[];
  answers: any[] = [];
  userInfo: any = {
    email: '',
    phoneNumber: '',
    fullName: '',
    billImageName: '',
  };
  @Input() imgName: string;
  imgSrc: string;
  finishSubmission: boolean = false;

  private activatedRoute = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private modalService = inject(NgbModal);
  private storageService = inject(StorageService);
  private toasterService = inject(ToasterService);

  constructor() {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.productId = params['productId'];
      this.gtinCode = params['gtin'];
      if (this.productId) {
        this.getMinigameQuestion(this.productId);
        this.getMiniGame(this.productId);
      }
      if (this.gtinCode) {
        this.getMiniGameByGtin(this.gtinCode);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.productCode.currentValue) {
      this.getMinigameQuestion(this.productId);
    }
  }

  getMiniGame(productId: string) {
    this.eventService.getByProductId(productId).subscribe({
      next: res => {
        if (res) {
          this.event = res;
          this.getImageUrl(res.coverImageName);
        }
      },
    });
  }


  getMiniGameByGtin(gtin: string) {
    this.eventService.getByGtinCode(gtin).subscribe({
      next: res => {
        if (res) {
          this.event = res;
          this.getImageUrl(res.coverImageName);
          this.getMinigameQuestion(res.productId)
        }
      },
    });
  }

  getMinigameQuestion(productId: string) {
    this.eventService.getMiniGameByProductId(productId).subscribe({
      next: res => {
        this.questionList = res;
      },
    });
  }

  getImageUrl(imageName: string) {
    if (imageName) {
      this.storageService.getFileUrlByFileName(imageName).subscribe({
        next: res => {
          this.imgSrc = res;
        },
      });
    }
  }

  onAnswerChange(event: any) {
    const index = this.answers.findIndex(
      answer => answer.questionId === event.questionId && answer.answerId === event.answerId,
    );

    if (event.remove) {
      if (index > -1) this.answers.splice(index, 1);
      return;
    }

    if (event.responseText !== undefined) {
      const textIndex = this.answers.findIndex(answer => answer.questionId === event.questionId);
      if (textIndex > -1) {
        this.answers[textIndex].responseText = event.responseText;
      } else {
        this.answers.push({
          questionId: event.questionId,
          responseText: event.responseText,
        });
      }
      return;
    }

    if (event.isRadio) {
      this.answers = this.answers.filter(answer => answer.questionId !== event.questionId);
    }

    if (index === -1) {
      this.answers.push({
        questionId: event.questionId,
        answerId: event.answerId,
      });
    }
  }

  openSubmitModal() {
    this.openUserInfoModal();
  }

  openUserInfoModal() {
    this.modalService.open(this.userInfoModal, { size: 'md', centered: true });
  }

  async submitAll(modal: any) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{9,15}$/;
    // const imageResponse = await this.uploadComponent.submitSingle();
    if (!this.userInfo.email || !emailPattern.test(this.userInfo.email)) {
      this.toasterService.error('Please enter a valid email');
      return;
    }

    if (!this.userInfo.phoneNumber || !phonePattern.test(this.userInfo.phoneNumber)) {
      this.toasterService.error('Please enter a valid phone number');
      return;
    }

    // if (!imageResponse) {
    //   this.toasterService.error('Bill image is required');
    //   return;
    // }

    if (!this.answers || this.answers.length === 0) {
      this.toasterService.error('Please answer all questions');
      return;
    }
    const payload = {
      eventId: this.event.id,
      latitude: 0,
      longitude: 0,
      browserInfo: navigator.userAgent,
      email: this.userInfo.email,
      phoneNumber: this.userInfo.phoneNumber,
      fullName: this.userInfo.fullName,
      billImageName:  '',
      questionResponses: this.answers,
    };

    this.eventService.submitMiniGame(payload).subscribe({
      complete: () => {
        modal.close();
        this.modalService.open(this.completedModal, { size: 'md', centered: true });
        this.finishSubmission = true;
      },
    });
  }

  dismissModal(modal: any) {
    modal.dismiss();
  }
}
