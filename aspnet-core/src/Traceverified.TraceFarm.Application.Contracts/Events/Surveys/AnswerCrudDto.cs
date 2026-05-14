using System;

namespace Traceverified.TraceFarm.Events.Surveys;

public class AnswerCrudDto
{
    public Guid? AnswerId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
    public bool IsCorrect { get; set; } = false;
}