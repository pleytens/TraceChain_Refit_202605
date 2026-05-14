using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.SpinResults")]
public class SpinResult: FullAuditedEntity<Guid>
{
    public Guid EventId { get; set; }
    public Guid SurveyInstanceId { get; set; }
    public string? Reason { get; set; } = string.Empty;
}