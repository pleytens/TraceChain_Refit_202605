using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepRecordDropdownFilterDto
{
    public Guid ProcessStepId { get; set; }
    public List<Guid?>? EntityIds { get; set; }
}