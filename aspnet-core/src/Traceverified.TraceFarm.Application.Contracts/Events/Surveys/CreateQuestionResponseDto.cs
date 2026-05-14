using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class CreateQuestionResponseDto
{
    public Guid QuestionId { get; set; }
    public string? ResponseText { get; set; } = string.Empty;
    public Guid AnswerId { get; set; }
}