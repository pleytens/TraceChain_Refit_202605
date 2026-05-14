using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.Questions")]
public class Question: FullAuditedAggregateRoot<Guid>
{
    public Guid EventId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int DataType { get; set; }
    public int Order { get; set; } = 0;
    public bool IsObligatory { get; set; } = false;
}
