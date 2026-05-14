using System;

namespace Traceverified.TraceFarm.Events.Surveys;

public class CreateSpinResultDto
{
    public Guid EventId { get; set; }
    public Guid SurveyInstanceId { get; set; }
    public string? Reason { get; set; } = string.Empty;
}