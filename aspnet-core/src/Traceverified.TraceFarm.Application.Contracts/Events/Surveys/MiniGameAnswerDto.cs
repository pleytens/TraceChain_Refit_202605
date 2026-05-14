using System;

namespace Traceverified.TraceFarm.Events.Surveys;

public class MiniGameAnswerDto
{
    public Guid? AnswerId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
}