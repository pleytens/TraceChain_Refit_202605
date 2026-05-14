using System;

namespace Traceverified.TraceFarm.Events.Surveys;

public class ResponseOptionDto
{
    public Guid QuestionResponseId { get; set; }
    public Guid AnswerId { get; set; }
}