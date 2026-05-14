using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.Events.Surveys;

public class MiniGameDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int DataType { get; set; }
    public int Order { get; set; } = 0;
    public bool IsObligatory { get; set; } = false;
    public List<MiniGameAnswerDto>? Answers { get; set; } = [];
}
