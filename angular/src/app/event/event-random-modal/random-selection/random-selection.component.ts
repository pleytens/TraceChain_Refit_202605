import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  type CreateSpinResultDto,
  type SpinResultDto,
  SurveyInstance4ShowDto,
} from '@proxy/traceverified/trace-farm/events/surveys';
import { CoreModule, LocalizationModule } from '@abp/ng.core';
import { EventService } from '@proxy/traceverified/trace-farm/events';
import { ToasterService } from '@abp/ng.theme.shared';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-random-selection',
  standalone: true,
  imports: [LocalizationModule, CoreModule],
  templateUrl: './random-selection.component.html',
  styleUrl: './random-selection.component.scss',
})
export class RandomSelectionComponent implements OnInit {
  @ViewChild('slot') slotElement!: ElementRef;
  @Input() participantList: SurveyInstance4ShowDto[] = [];
  @Input() eventId: string;
  spinning = false;
  index = 0;
  rafId: number | null = null;
  spinCount: number = 0;
  reason: string | null = null;
  latestWinnerList: SpinResultDto[];

  private eventService = inject(EventService);
  private toasterService = inject(ToasterService);
  private activeModal = inject(NgbActiveModal);

  ngOnInit() {
    this.getResult();
  }

  getResult() {
    this.eventService.getSpinHistory(this.eventId).subscribe({
      next: result => {
        this.latestWinnerList = result.items;
      },
    });
  }

  spin(durationMs = 1500) {
    if (this.spinning) return;
    this.spinCount++;
    this.spinning = true;

    const start = performance.now();
    let lastTick = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const interval = 50 + 350 * progress;

      if (elapsed >= lastTick) {
        this.index = (this.index + 1) % this.participantList.length;
        this.triggerFlip();
        lastTick = elapsed + interval;
      }

      if (progress < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.spinning = false;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  triggerFlip() {
    const el = this.slotElement.nativeElement;
    el.classList.remove('animate-flip');
    void el.offsetWidth;
    el.classList.add('animate-flip');
  }

  save() {
    if (this.spinCount < 1) {
      this.toasterService.error('::Minigame:PleaseSpinToSelectWinner');
      return;
    }
    if (this.latestWinnerList?.length > 0 && !this.reason) {
      this.toasterService.error('::Minigame:PleaseProvideReasonForSpinAgain');
      return;
    }
    const payload: CreateSpinResultDto = {
      eventId: this.eventId,
      reason: this.reason,
      surveyInstanceId: this.participantList[this.index].id,
    };
    this.eventService.createSpinResult(payload).subscribe({
      complete: () => {
        this.toasterService.success('::Minigame:SaveResultSuccess');
        this.activeModal.close();
      },
    });
  }

  dismissModal() {
    this.activeModal.dismiss();
  }
}
