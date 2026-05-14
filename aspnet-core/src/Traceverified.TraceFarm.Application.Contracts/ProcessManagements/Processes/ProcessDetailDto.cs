using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessDetailDto
{
    public Guid Id { get; set; }
    public string StepName { get; set; }
    public string? StepDescription { get; set; }
    public int Position { get; set; }
    public List<string> UserInStep { get; set; }
}