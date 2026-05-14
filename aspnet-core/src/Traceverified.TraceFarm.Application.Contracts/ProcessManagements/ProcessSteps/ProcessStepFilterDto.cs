using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStepFilterDto : RequestCustomDto
{
    public Guid ProcessId { get; set; }
}