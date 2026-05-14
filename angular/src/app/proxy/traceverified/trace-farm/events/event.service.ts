import type { EventCrudDto, EventDto, EventFilterDto, EventShowDto } from './models';
import type { CreateSpinResultDto, CreateSurveyInstanceDto, MiniGameDto, SpinResultDto, SurveyInstance4ShowDto } from './surveys/models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  apiName = 'Default';
  

  create = (input: EventDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventDto>({
      method: 'POST',
      url: '/api/app/event',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  createSpinResult = (input: CreateSpinResultDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SpinResultDto>({
      method: 'POST',
      url: '/api/app/event/spin-result',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  createWithQuestion = (input: EventCrudDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/event/with-question',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/event/${id}`,
    },
    { apiName: this.apiName,...config });
  

  deleteEventWithQuestions = (eventId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'DELETE',
      url: `/api/app/event/event-with-questions/${eventId}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventDto>({
      method: 'GET',
      url: `/api/app/event/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getByGtinCode = (gtinCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventDto>({
      method: 'GET',
      url: '/api/app/event/by-gtin-code',
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  getByProductId = (productId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventDto>({
      method: 'GET',
      url: `/api/app/event/by-product-id/${productId}`,
    },
    { apiName: this.apiName,...config });
  

  getEventWithQuestions = (eventId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventCrudDto>({
      method: 'GET',
      url: `/api/app/event/event-with-questions/${eventId}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<EventDto>>({
      method: 'GET',
      url: '/api/app/event',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getListCustom = (input: EventFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<EventShowDto>>({
      method: 'GET',
      url: '/api/app/event/custom',
      params: { filterText: input.filterText, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getMiniGame = (gtinCode: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MiniGameDto[]>({
      method: 'GET',
      url: '/api/app/event/mini-game',
      params: { gtinCode },
    },
    { apiName: this.apiName,...config });
  

  getMiniGameByProductId = (productId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MiniGameDto[]>({
      method: 'GET',
      url: `/api/app/event/mini-game-by-product-id/${productId}`,
    },
    { apiName: this.apiName,...config });
  

  getSpinHistory = (eventId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<SpinResultDto>>({
      method: 'GET',
      url: `/api/app/event/spin-history/${eventId}`,
    },
    { apiName: this.apiName,...config });
  

  getSurveyInstances = (eventId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<SurveyInstance4ShowDto>>({
      method: 'GET',
      url: `/api/app/event/survey-instances/${eventId}`,
    },
    { apiName: this.apiName,...config });
  

  submitMiniGame = (input: CreateSurveyInstanceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/event/submit-mini-game',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: EventDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, EventDto>({
      method: 'PUT',
      url: `/api/app/event/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateWithQuestion = (eventId: string, input: EventCrudDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'PUT',
      url: `/api/app/event/with-question/${eventId}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
