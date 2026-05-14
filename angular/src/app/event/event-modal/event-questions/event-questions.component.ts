import { Component, inject, OnInit } from '@angular/core';
import { QuestionsCardComponent } from './questions-card/questions-card.component';
import { QuestionCrudDto } from '@proxy/traceverified/trace-farm/events/surveys';
import { ToasterService } from '@abp/ng.theme.shared';
import { isArray } from '@abp/ng.core';
import { PartnerService } from '@proxy/traceverified/trace-farm/partners';

@Component({
  selector: 'app-event-questions',
  standalone: true,
  imports: [QuestionsCardComponent],
  templateUrl: './event-questions.component.html',
  styleUrl: './event-questions.component.scss',
})
export class EventQuestionsComponent implements OnInit {
  eventId: string;
  questionList: QuestionCrudDto[] = [];
  partnerData = [];

  private toasterService = inject(ToasterService);
  private partnerService = inject(PartnerService);

  constructor() {
    this.getPartnerDropDown();
  }

  ngOnInit() {
    if (!this.eventId) {
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
        order: 0,
      };

      this.questionList.push(newQuestion);
    }
  }

  getPartnerDropDown() {
    this.partnerService.getPartnerDropdown().subscribe({
      next: res => {
        this.partnerData = res.items;
      },
    });
  }
  addQuestion(questionData: QuestionCrudDto) {
    this.questionList.push(questionData);
  }

  deleteQuestion(questionIndex: number) {
    this.questionList.splice(questionIndex, 1);
  }

  validateQuestion(question: QuestionCrudDto): boolean {
    if (!question.questionText) {
      this.toasterService.error('::Event:QuestionTextRequire', '::Error');
      return false;
    }

    for (const answer of question.answers) {
      if (!answer.answerText) {
        this.toasterService.error('::Event:AnswerTextRequire', '::Error');
        return false;
      }
    }

    return true;
  }

  submit() {
    for (const question of this.questionList) {
      if (!this.validateQuestion(question)) {
        return;
      }
    }
    const questionPayload: QuestionCrudDto[] = this.questionList.map(question => {
      let datatype = 0;
      if (isArray(question.dataType)) {
        datatype = question.dataType[0];
      } else {
        datatype = question.dataType;
      }
      return {
        ...question,
        dataType: datatype,
      };
    });
    return questionPayload;
  }
}
