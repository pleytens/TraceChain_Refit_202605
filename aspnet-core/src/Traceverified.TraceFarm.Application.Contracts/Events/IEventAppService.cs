using System;
using System.Collections.Generic;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Events.Surveys;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Events;

public interface IEventAppService : IApplicationService
{
    Task<bool> CreateWithQuestionAsync(EventCrudDto input);
    Task<bool> UpdateWithQuestionAsync(Guid eventId, EventCrudDto input);
    Task<EventCrudDto> GetEventWithQuestionsAsync(Guid eventId);
    Task<bool> DeleteEventWithQuestionsAsync(Guid eventId);
    Task<List<MiniGameDto>> GetMiniGameAsync(string gtinCode);
    Task<List<MiniGameDto>> GetMiniGameByProductIdAsync(Guid productId);
    Task<PagedResultDto<EventShowDto>> GetListCustomAsync(EventFilterDto input);
    Task<bool> SubmitMiniGameAsync(CreateSurveyInstanceDto input);
    Task<EventDto?> GetByGtinCodeAsync(string gtinCode);
    Task<EventDto?> GetByProductIdAsync(Guid productId);
    Task<PagedResultDto<SurveyInstance4ShowDto>> GetSurveyInstancesAsync(Guid eventId);
    Task<SpinResultDto> CreateSpinResultAsync(CreateSpinResultDto input);
    Task<ListResultDto<SpinResultDto>> GetSpinHistoryAsync(Guid eventId);
}