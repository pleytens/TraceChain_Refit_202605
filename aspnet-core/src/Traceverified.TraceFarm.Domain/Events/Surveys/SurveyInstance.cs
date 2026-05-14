using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Events.Surveys;

[Table("Event.SurveyInstances")]
public class SurveyInstance: FullAuditedAggregateRoot<Guid>
{
    public Guid EventId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? BrowserInfo { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? FullName { get; set; } = string.Empty;
    public string? BillImageName { get; set; } = string.Empty;
}