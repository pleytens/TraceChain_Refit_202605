using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class SurveyInstance4ShowDto: AuditedEntityDto<Guid>
{
    public string? Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? FullName { get; set; } = string.Empty;
    public string? BillImageName { get; set; } = string.Empty;
    public string? BillImageUrl { get; set; } = string.Empty;
    public string? Result { get; set; } = string.Empty;
}