import type { AuditedEntityDto } from '@abp/ng.core';

export interface AnswerCrudDto {
  answerId?: string;
  answerText?: string;
  order: number;
  isCorrect: boolean;
}

export interface QuestionCrudDto {
  questionId?: string;
  questionText?: string;
  dataType: number;
  order: number;
  isObligatory: boolean;
  answers: AnswerCrudDto[];
}

export interface CreateQuestionResponseDto {
  questionId?: string;
  responseText?: string;
  answerId?: string;
}

export interface CreateSpinResultDto {
  eventId?: string;
  surveyInstanceId?: string;
  reason?: string;
}

export interface CreateSurveyInstanceDto {
  eventId?: string;
  latitude?: number;
  longitude?: number;
  browserInfo?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  billImageName?: string;
  questionResponses: CreateQuestionResponseDto[];
}

export interface MiniGameAnswerDto {
  answerId?: string;
  answerText?: string;
  order: number;
}

export interface MiniGameDto {
  questionId?: string;
  questionText?: string;
  dataType: number;
  order: number;
  isObligatory: boolean;
  answers: MiniGameAnswerDto[];
}

export interface SpinResultDto {
  id?: string;
  email?: string;
  creationTime?: string;
  reason?: string;
}

export interface SurveyInstance4ShowDto extends AuditedEntityDto<string> {
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  billImageName?: string;
  billImageUrl?: string;
  result?: string;
}
