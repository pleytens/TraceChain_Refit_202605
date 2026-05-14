using System;

namespace Traceverified.TraceFarm.Events.Surveys;

public class SpinResultDto
{
    public Guid Id { get; set; }
    public string? Email { get; set; } = null!;
    public DateTime? CreationTime { get; set; }
    public string? Reason { get; set; } = string.Empty;
}