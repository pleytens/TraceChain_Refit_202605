import type { QuestionCrudDto } from './surveys/models';
import type { AuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface EventCrudDto {
  coverImageName?: string;
  code?: string;
  title?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  questions: QuestionCrudDto[];
}

export interface EventDto extends AuditedEntityDto<string> {
  title?: string;
  slug?: string;
  shortDescription?: string;
  content?: string;
  status: number;
  language?: string;
  groupId?: string;
  startDate?: string;
  endDate?: string;
  coverImageName?: string;
  coverImageUrl?: string;
  views: number;
  creationTimeStr?: string;
  eventType: number;
  code?: string;
  productId?: string;
}

export interface EventFilterDto extends PagedAndSortedResultRequestDto {
  filterText?: string;
}

export interface EventShowDto {
  id?: string;
  code?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  creationTime?: string;
  views: number;
  questionCount: number;
  participantCount: number;
}
