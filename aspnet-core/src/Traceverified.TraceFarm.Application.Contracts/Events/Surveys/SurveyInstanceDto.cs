using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class SurveyInstanceDto: AuditedEntityDto<Guid>
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