using System;

namespace Traceverified.TraceFarm.Events;

public class EventShowDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? CreationTime { get; set; }
    public int Views { get; set; }
    public int QuestionCount { get; set; }
    public int ParticipantCount { get; set; }
}