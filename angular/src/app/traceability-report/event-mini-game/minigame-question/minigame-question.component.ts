import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { MiniGameAnswerDto, MiniGameDto, QuestionCrudDto } from '@proxy/traceverified/trace-farm/events/surveys';
import {
  QuestionDataType,
  QuestionDataTypeEnum,
} from '../../../shared/common/constant.variable.model';
import { CoreModule, LocalizationModule } from '@abp/ng.core';
import { QuestionModel } from '../../../event/event-modal/event-questions/model';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-minigame-question',
  standalone: true,
  imports: [LocalizationModule, NgSwitch, NgSwitchCase, CoreModule],
  templateUrl: './minigame-question.component.html',
  styleUrl: './minigame-question.component.scss',
})
export class MinigameQuestionComponent {
  @Input() answerType: Number;
  @Input() questionId: string;
  @Input() answer: MiniGameAnswerDto;
  @Input() question: MiniGameDto;

  @Output() answerChange = new EventEmitter<any>();
  selectAnswer(answerId: string) {
    this.answerChange.emit({
      questionId: this.question.questionId,
      answerId,
      isRadio: true,
    });
  }

  toggleCheckbox(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.answerChange.emit({
      questionId: this.question.questionId,
      answerId:  id ,
      remove: !input.checked,
    });
  }

  onTextChange(evet: Event) {
    const input = evet.target as HTMLInputElement;
    this.answerChange.emit({
      questionId: this.question.questionId,
      responseText: input.value,
    });
  }
  protected readonly QuestionDataType = QuestionDataType;
  protected readonly QuestionDataTypeEnum = QuestionDataTypeEnum;
}
