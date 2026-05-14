using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class ProcessStepRecordOutputDto
{
    public Guid ProcessStepId { get; set; }
    public string Name { get; set; }
    public int Position { get; set; }
    public int IsSpecial { get; set; }
}