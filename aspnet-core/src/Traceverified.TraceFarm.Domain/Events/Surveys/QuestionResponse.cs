using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.QuestionResponses")]
public class QuestionResponse: FullAuditedAggregateRoot<Guid>
{
    public Guid SurveyInstanceId { get; set; }
    public Guid QuestionId { get; set; }
    public string? ResponseText { get; set; } = string.Empty;
}