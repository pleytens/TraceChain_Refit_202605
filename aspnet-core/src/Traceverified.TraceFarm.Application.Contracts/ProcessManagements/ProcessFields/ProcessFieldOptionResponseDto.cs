using System;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldOptionResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } // is OptionValue
    public Guid? EntityId { get; set; }
    public bool Selected { get; set; }
    public string? ResponseText { get; set; } = string.Empty;
    public Guid? ExecutorId { get; set; }
    public Guid ProcessFieldOptionId { get; set; }
}