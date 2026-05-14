using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.ProcessManagements;

public class CreateUpdateProcessStepDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public Guid? ReceptacleId { get; set; }
    public Guid ProcessId { get; set; }
    public List<Guid> UserTagIds { get; set; }
    public int? IsSpecial { get; set; }
    public int Position { get; set; } = 0;
}