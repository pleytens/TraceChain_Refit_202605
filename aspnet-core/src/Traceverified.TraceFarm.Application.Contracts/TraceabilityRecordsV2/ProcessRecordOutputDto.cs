using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class ProcessRecordOutputDto
{
    public string Name { get; set; }
    public int StepCount { get; set; }
    public string CreatedBy { get; set; }
    public Guid ProcessId { get; set; }
}