using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class QuestionResponseDto: AuditedEntityDto<Guid>
{
    public Guid SurveyInstanceId { get; set; }
    public Guid QuestionId { get; set; }
    public string? ResponseText { get; set; } = string.Empty;
}