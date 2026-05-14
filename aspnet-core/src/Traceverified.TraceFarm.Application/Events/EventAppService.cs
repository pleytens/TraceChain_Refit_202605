using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Events.Surveys;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.ProductManagements;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Events;

public class EventAppService(IRepository<Event, Guid> eventRepository,
    IRepository<Question, Guid> questionRepository,
    IRepository<SurveyInstance, Guid> surveyInstanceRepository,
    IRepository<ResponseOption, Guid> responseOptionRepo,
    IRepository<QuestionResponse, Guid> questionResponseRepo,
    IProductAppService productAppService,
    IRepository<Answer, Guid> answerRepository,
    IRepository<SpinResult, Guid> spinResultRepository,
    IDataFilter dataFilter,
    IStorageAppService storageAppService
) : CrudAppService<
        Event, //The Event entity
        EventDto, //Used to show books
        Guid, //Primary key of the book entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        EventDto //Used to create/update a event, IEventAppService
    >(eventRepository), 
    IEventAppService
{
    public async Task<bool> CreateWithQuestionAsync(EventCrudDto input)
    {
        var eventObj = new Event()
        {
            Title = input.Title,
            Status = (int)EventStatus.Published,
            Language = "vi",
            StartDate = input.StartDate,
            EndDate = input.EndDate,
            CoverImageName = input.CoverImageName,
            Views = 0,
            EventType = (int)EventTypeEnum.MiniGame,
            Code = input.Code,
            TenantId = CurrentTenant.Id,
            ProductId = input.ProductId,
        };
        var eventInsert =  await Repository.InsertAsync(eventObj, true);
        
        foreach (var question in input.Questions)
        {
            var questionObj = new Question()
            {
                QuestionText = question.QuestionText,
                EventId = eventInsert.Id,
                DataType = question.DataType,
                Order = question.Order,
                IsObligatory = question.IsObligatory
            };
            var questionInsert = await questionRepository.InsertAsync(questionObj, true);

            var answerLst = question.Answers.Select(answer => new Answer
            {
                AnswerText = answer.AnswerText,
                QuestionId = questionInsert.Id,
                Order = answer.Order,
                IsCorrect = answer.IsCorrect,
            }).ToList();
            if (answerLst.Any())
            {
                await answerRepository.InsertManyAsync(answerLst, true);
            }
        }
        return true;
    }

    public async Task<bool> UpdateWithQuestionAsync(Guid eventId, EventCrudDto input)
    {
        var eventObj = await Repository.GetAsync(eventId);
        eventObj.Title = input.Title;
        eventObj.Status = (int)EventStatus.Published;
        eventObj.Language = "vi";
        eventObj.StartDate = input.StartDate;
        eventObj.EndDate = input.EndDate;
        eventObj.CoverImageName = input.CoverImageName;
        eventObj.Views = 0;
        eventObj.EventType = (int)EventTypeEnum.MiniGame;
        eventObj.Code = input.Code;
        eventObj.ProductId = input.ProductId;
        await Repository.UpdateAsync(eventObj, true);
        var questionCurrent = await questionRepository.GetListAsync(q => q.EventId == eventId);
        var questionsToDelete = questionCurrent
            .Where(q => !input.Questions.Any(inputQ => 
                inputQ.QuestionId != null && inputQ.QuestionId == q.Id))
            .ToList();
        // Delete these questions
        if (questionsToDelete.Any())
        {
            await questionRepository.DeleteManyAsync(questionsToDelete, true);
        }
        foreach (var question in input.Questions)
        {
            if (question.QuestionId == null || question.QuestionId == Guid.Empty)
            {
                // Create new question
                var questionObj = new Question()
                {
                    QuestionText = question.QuestionText,
                    EventId = eventObj.Id,
                    DataType = question.DataType,
                    Order = question.Order,
                    IsObligatory = question.IsObligatory
                };
                var questionInsert = await questionRepository.InsertAsync(questionObj, true);

                var answerLst = question.Answers.Select(answer => new Answer
                {
                    AnswerText = answer.AnswerText,
                    QuestionId = questionInsert.Id,
                    Order = answer.Order,
                    IsCorrect = answer.IsCorrect,
                }).ToList();
                if (answerLst.Any())
                {
                    await answerRepository.InsertManyAsync(answerLst, true);
                }
            }
            else
            {
                await UpdateQuestionAsync(question);
            }
        }

        return true;
    }
    
    private async Task UpdateQuestionAsync(QuestionCrudDto question)
    {
        if (question.QuestionId == null || question.QuestionId == Guid.Empty)
        {
            return;
        }
        var questionObj = await questionRepository.GetAsync(question.QuestionId.Value);
        questionObj.QuestionText = question.QuestionText;
        questionObj.DataType = question.DataType;
        questionObj.Order = question.Order;
        questionObj.IsObligatory = question.IsObligatory;
        await questionRepository.UpdateAsync(questionObj, true);
        // Get current answers for this question
        var answersCurrent = await answerRepository.GetListAsync(a => a.QuestionId == questionObj.Id);

        // Find answers to delete (exist in DB but not in input)
        var answersToDelete = answersCurrent
            .Where(a => !question.Answers.Any(inputA => 
                inputA.AnswerId != null && inputA.AnswerId == a.Id))
            .ToList();

        // Delete these answers
        if (answersToDelete.Any())
        {
            await answerRepository.DeleteManyAsync(answersToDelete, true);
        }
        // Update answers
        foreach (var answer in question.Answers)
        {
            if (answer.AnswerId == null || answer.AnswerId == Guid.Empty)
            {
                var answerObj = new Answer
                {
                    AnswerText = answer.AnswerText,
                    QuestionId = questionObj.Id,
                    Order = answer.Order,
                    IsCorrect = answer.IsCorrect,   
                };
                await answerRepository.InsertAsync(answerObj, true);
            }
            else
            {
                var answerObj = await answerRepository.GetAsync(answer.AnswerId.Value);
                answerObj.AnswerText = answer.AnswerText;
                answerObj.Order = answer.Order;
                answerObj.IsCorrect = answer.IsCorrect;
                await answerRepository.UpdateAsync(answerObj, true);
            }
        }
    }
    
    public async Task<EventCrudDto> GetEventWithQuestionsAsync(Guid eventId)
    {
        var eventObj = await Repository.GetAsync(eventId);
        var questions = await questionRepository.GetListAsync(q => q.EventId == eventId);

        var eventDto = new EventCrudDto
        {
            Title = eventObj.Title,
            StartDate = eventObj.StartDate,
            EndDate = eventObj.EndDate,
            CoverImageName = eventObj.CoverImageName,
            Code = eventObj.Code,
            ProductId = eventObj.ProductId,
            Questions = new List<QuestionCrudDto>()
        };

        foreach (var question in questions)
        {
            var questionDto = await GetQuestionCrudDtoAsync(question);
            eventDto.Questions.Add(questionDto);
        }
        return eventDto;
    }
    
    private async Task<QuestionCrudDto> GetQuestionCrudDtoAsync(Question question)
    {
        var answers = await answerRepository.GetListAsync(a => a.QuestionId == question.Id);
    
        return new QuestionCrudDto
        {
            QuestionId = question.Id,
            QuestionText = question.QuestionText,
            DataType = question.DataType,
            Order = question.Order,
            Answers = answers.Select(a => new AnswerCrudDto
            {
                AnswerId = a.Id,
                AnswerText = a.AnswerText,
                Order = a.Order,
                IsCorrect = a.IsCorrect,
            }).ToList()
        };
    }
    
    public async Task<bool> DeleteEventWithQuestionsAsync(Guid eventId)
    {
        // Get all questions related to this event
        var questions = await questionRepository.GetListAsync(q => q.EventId == eventId);
    
        foreach (var question in questions)
        {
            // Delete all answers related to each question
            await answerRepository.DeleteAsync(a => a.QuestionId == question.Id);
        }
    
        // Delete all questions
        if (questions.Any())
        {
            await questionRepository.DeleteManyAsync(questions);
        }
    
        // Delete the event
        await Repository.DeleteAsync(eventId);
    
        return true;
    }
    
    public async Task<List<MiniGameDto>> GetMiniGameAsync(string gtinCode)
    {
        var productId = await productAppService.GetProductIdByGtinCodeAsync(gtinCode);
        if (productId == null || productId == Guid.Empty)
        {
            return [];
        }
        var answerQuery = await answerRepository.GetQueryableAsync();
        var eventQuery= await Repository.GetQueryableAsync();
        var eventId = eventQuery.Where(e => e.ProductId == productId
                                            && e.EventType == (int)EventTypeEnum.MiniGame
                                            && e.StartDate.Date <= DateTime.Now.Date
                                            && e.EndDate.Date >= DateTime.Now.Date
                                            )
                            .Select(e => e.Id).FirstOrDefault();
        
        var questions = await questionRepository.GetListAsync(q => q.EventId == eventId);
        var miniGames = questions.Select(q => new MiniGameDto
        {
            QuestionId = q.Id,
            QuestionText = q.QuestionText,
            DataType = q.DataType,
            Order = q.Order,
            IsObligatory = q.IsObligatory,
            Answers = answerQuery.Where(a => a.QuestionId == q.Id)
                .Select(a => new MiniGameAnswerDto
                {
                    AnswerId = a.Id,
                    AnswerText = a.AnswerText,
                    Order = a.Order
                }).ToList(),
        }).ToList();

        return miniGames;
    }
    
    public async Task<List<MiniGameDto>> GetMiniGameByProductIdAsync(Guid productId)
    {
        using(dataFilter.Disable<IMultiTenant>())
        {
            var answerQuery = await answerRepository.GetQueryableAsync();
            var eventQuery= await Repository.GetQueryableAsync();
            var eventId = eventQuery.Where(e => e.ProductId == productId
                                                && e.EventType == (int)EventTypeEnum.MiniGame
                                                && e.StartDate.Date <= DateTime.Now.Date
                                                && e.EndDate.Date >= DateTime.Now.Date
                )
                .Select(e => e.Id).FirstOrDefault();
        
            var questions = await questionRepository.GetListAsync(q => q.EventId == eventId);
            var miniGames = questions.Select(q => new MiniGameDto
            {
                QuestionId = q.Id,
                QuestionText = q.QuestionText,
                DataType = q.DataType,
                Order = q.Order,
                IsObligatory = q.IsObligatory,
                Answers = answerQuery.Where(a => a.QuestionId == q.Id)
                    .Select(a => new MiniGameAnswerDto
                    {
                        AnswerId = a.Id,
                        AnswerText = a.AnswerText,
                        Order = a.Order
                    }).ToList(),
            }).ToList();

            return miniGames;
        }
    }

    public async Task<PagedResultDto<EventShowDto>> GetListCustomAsync(EventFilterDto input)
    {
        var query = await Repository.GetQueryableAsync();
        var questionQuery = await questionRepository.GetQueryableAsync();
        var surveyInstanceQuery = await surveyInstanceRepository.GetQueryableAsync();
        
        var filteredQuery = query.WhereIf(!string.IsNullOrWhiteSpace(input.FilterText),
            e => input.FilterText != null 
                 && (e.Title.Contains(input.FilterText) 
                     || (e.Code != null &&  e.Code.Contains(input.FilterText))
                     )
                 );
        var totalCount = await AsyncExecuter.CountAsync(filteredQuery);
        var items = filteredQuery
            .OrderBy(input.Sorting ?? "CreationTime")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).Select(n=>new EventShowDto
            {
                Id = n.Id,
                Title = n.Title,
                StartDate = n.StartDate,
                EndDate = n.EndDate,
                Code = n.Code,
                CreationTime = n.CreationTime,
                Views = n.Views,
                QuestionCount = questionQuery.Count(q => q.EventId == n.Id),
                ParticipantCount = surveyInstanceQuery.Count(g=>g.EventId == n.Id)
            }).ToList();
        return new PagedResultDto<EventShowDto>(
            totalCount,
            items
        );
    }

    public async Task<bool> SubmitMiniGameAsync(CreateSurveyInstanceDto input)
    {
        var surveyInstance = new SurveyInstance
        {
            EventId = input.EventId,
            Email = input.Email,
            PhoneNumber = input.PhoneNumber,
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            BrowserInfo = input.BrowserInfo,
            FullName = input.FullName,
            BillImageName = input.BillImageName,
        };
        var surveyInstanceInsert = await surveyInstanceRepository.InsertAsync(surveyInstance,true);
        foreach (var item in input.QuestionResponses)
        {
            var questionResponse = new QuestionResponse
            {
                SurveyInstanceId = surveyInstanceInsert.Id,
                QuestionId = item.QuestionId,
                ResponseText = item.ResponseText,
            };
            await questionResponseRepo.InsertAsync(questionResponse, true);
            var responseOptions = new ResponseOption
            {
                QuestionResponseId = questionResponse.Id,
                AnswerId = item.AnswerId,
            };
            await responseOptionRepo.InsertAsync(responseOptions, true);
        }
        return true;
    }
    
    public async Task<EventDto?> GetByGtinCodeAsync(string gtinCode)
    {
        
        var productId = await productAppService.GetProductIdByGtinCodeAsync(gtinCode);
        if (productId == null || productId == Guid.Empty)
        {
            return null;
        }
        var eventObj = await Repository.FirstOrDefaultAsync(e => e.ProductId == productId 
                                                                 && e.EventType == (int)EventTypeEnum.MiniGame
                                                                 && e.StartDate.Date <= DateTime.Now.Date
                                                                 && e.EndDate.Date >= DateTime.Now.Date);
        return eventObj == null ? null : ObjectMapper.Map<Event, EventDto>(eventObj);
    }

    public async Task<EventDto?> GetByProductIdAsync(Guid productId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var eventObj = await Repository.FirstOrDefaultAsync(e => e.ProductId == productId 
                                                                     && e.EventType == (int)EventTypeEnum.MiniGame
                                                                     && e.StartDate.Date <= DateTime.Now.Date
                                                                     && e.EndDate.Date >= DateTime.Now.Date);
            return eventObj == null ? null : ObjectMapper.Map<Event, EventDto>(eventObj);
        }
    }
    public async Task<PagedResultDto<SurveyInstance4ShowDto>> GetSurveyInstancesAsync(Guid eventId)
    {
        var questionRepo = await questionRepository.GetQueryableAsync();
        var responseOptionQuery = await responseOptionRepo.GetQueryableAsync();
        var questionResponseQuery = await questionResponseRepo.GetQueryableAsync();
        var answerQuery = await answerRepository.GetQueryableAsync();
        
        var query = await surveyInstanceRepository.GetQueryableAsync();
        var filteredQuery = query.Where(s => s.EventId == eventId);
        var totalCount = await AsyncExecuter.CountAsync(filteredQuery);
        var items = filteredQuery
            .OrderByDescending(s => s.CreationTime)
            .Select(s => new SurveyInstance4ShowDto
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                PhoneNumber = s.PhoneNumber,
                BillImageName = s.BillImageName,
                CreationTime = s.CreationTime
            }).ToList();
        var totalQuestions = questionRepo.Count(q => q.EventId == eventId);
        
        foreach (var item in items)
        {
            var answerResult = from qr in questionResponseQuery
                join ro in responseOptionQuery on qr.Id equals ro.QuestionResponseId into responseOptionJoin
                from ro in responseOptionJoin.DefaultIfEmpty()
                join a in answerQuery on ro.AnswerId equals a.Id into answerJoin
                from a in answerJoin.DefaultIfEmpty()
                where qr.SurveyInstanceId == item.Id
                select new 
                {
                    result = ro == null || a == null || a.IsCorrect
                };
            var correctAnswers = answerResult.Count(r => r.result);
            item.Result = $"{correctAnswers}/{totalQuestions}";
            if (item.BillImageName != null)
            {
                item.BillImageUrl = storageAppService.GetFileUrl(item.BillImageName);
            }
        }
        return new PagedResultDto<SurveyInstance4ShowDto>(
            totalCount,
            items
        );
    }

    public async Task<SpinResultDto> CreateSpinResultAsync(CreateSpinResultDto input)
    {
        var spinResult = new SpinResult
        {
            EventId = input.EventId,
            SurveyInstanceId = input.SurveyInstanceId,
            Reason = input.Reason,
        };
        var spinResultInsert = await spinResultRepository.InsertAsync(spinResult, true);
        var surveyInstance = await surveyInstanceRepository.GetAsync(input.SurveyInstanceId);
        return new SpinResultDto
        {
            Id = spinResult.Id,
            Reason = spinResultInsert.Reason,
            Email = string.IsNullOrEmpty(surveyInstance.Email)? surveyInstance.PhoneNumber : surveyInstance.Email,
            CreationTime = spinResultInsert.CreationTime
        };
    }

    public async Task<ListResultDto<SpinResultDto>> GetSpinHistoryAsync(Guid eventId)
    {
        var query = await spinResultRepository.GetQueryableAsync();
        var surveyInstanceQuery = await surveyInstanceRepository.GetQueryableAsync();
        var filteredQuery = query.Where(s => s.EventId == eventId);
        var spinResults = filteredQuery
            .OrderByDescending(s => s.CreationTime)
            .Select(s => new SpinResultDto
            {
                Id = s.Id,
                Reason = s.Reason,
                Email = surveyInstanceQuery
                    .Where(si => si.Id == s.SurveyInstanceId)
                    .Select(si => string.IsNullOrEmpty(si.Email) ? si.PhoneNumber : si.Email)
                    .FirstOrDefault(),
                CreationTime = s.CreationTime
            }).ToList();
        return new ListResultDto<SpinResultDto>(spinResults);
    }
}