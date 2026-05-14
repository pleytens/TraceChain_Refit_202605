using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.Answers")]
public class Answer: FullAuditedAggregateRoot<Guid>
{
    public Guid QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
    public bool IsCorrect { get; set; } = false;
}