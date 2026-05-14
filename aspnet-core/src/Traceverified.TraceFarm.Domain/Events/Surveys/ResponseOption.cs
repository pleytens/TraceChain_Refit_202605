using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.ResponseOptions")]
public class ResponseOption: FullAuditedAggregateRoot<Guid>
{
    public Guid QuestionResponseId { get; set; }
    public Guid AnswerId { get; set; }
}