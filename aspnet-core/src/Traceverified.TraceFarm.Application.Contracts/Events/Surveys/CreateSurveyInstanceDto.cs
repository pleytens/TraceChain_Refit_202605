using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.Events.Surveys;

public class CreateSurveyInstanceDto
{
    public Guid EventId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? BrowserInfo { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? FullName { get; set; } = string.Empty;
    public string? BillImageName { get; set; } = string.Empty;
    public List<CreateQuestionResponseDto> QuestionResponses { get; set; } = [];
}