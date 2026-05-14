import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import {
  IMultiSelectSettings,
  IMultiSelectTexts,
  NgxBootstrapMultiselectModule,
} from 'ngx-bootstrap-multiselect';
import { QuestionCrudDto } from '@proxy/traceverified/trace-farm/events/surveys';
import {
  QuestionDataType,
  QuestionDataTypeEnum,
} from '../../../../shared/common/constant.variable.model';
@Component({
  selector: 'app-questions-card',
  standalone: true,
  imports: [LocalizationModule, NgxBootstrapMultiselectModule, BaseCoreModule],
  templateUrl: './questions-card.component.html',
  styleUrl: './questions-card.component.scss',
})
export class QuestionsCardComponent {
  @Output() questionEmit = new EventEmitter<QuestionCrudDto>();
  @Output() deleteQuestionEmit = new EventEmitter<number>();
  @Input() questionIndex: number;
  @Input() questionModel: QuestionCrudDto = {
    questionText: '',
    isObligatory: false,
    dataType: 0,
    answers: [],
    order: 0,
  };
  @Input() partnerDropdownData = []
  singleSelectSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'form-control form-select text-start remove-arrow',
    containerClasses: 'w-100',
    itemClasses: 'text-center',
    selectionLimit: 1,
    autoUnselect: true,
    displayAllSelectedText: false,
  };
  MultiText: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Nothing found...',
    searchNoRenderText: 'Type in search box to see results...',
    defaultTitle: '',
    allSelected: 'All selected',
  };

  constructor(
  ) {
  }

  addAnswer() {
    this.questionModel.answers.push({
      isCorrect: false,
      answerText: '',
      order: this.questionModel.answers.length,
    });
  }

  deleteAnswer(index: number) {
    this.questionModel.answers.splice(index, 1);
  }

  addQuestion() {
    const newQuestion: QuestionCrudDto = {
      answers: [
        {
          answerText: '',
          isCorrect: false,
          order: 0,
        },
      ],
      dataType: 0,
      isObligatory: false,
      questionText: '',
      order: this.questionModel.order + 1,
    };

    this.questionEmit.emit(newQuestion);
  }

  deleteQuestion() {
    this.deleteQuestionEmit.emit(this.questionIndex);
  }

  duplicateQuestion() {
    const questionCopied: QuestionCrudDto = {
      ...this.questionModel,
      questionId: null,
      order: this.questionModel.order + 1,
      answers: this.questionModel.answers.map(answer => {
        return {
          ...answer,
          answerId: null,
        };
      }),
    };
    this.questionEmit.emit(questionCopied);
  }

  protected readonly QuestionDataType = QuestionDataType;
  protected readonly QuestionDataTypeEnum = QuestionDataTypeEnum;
}
