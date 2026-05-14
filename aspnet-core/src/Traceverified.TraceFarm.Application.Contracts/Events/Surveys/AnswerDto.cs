using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class AnswerDto: AuditedEntityDto<Guid>
{
    public Guid QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int Order { get; set; } = 0;
}