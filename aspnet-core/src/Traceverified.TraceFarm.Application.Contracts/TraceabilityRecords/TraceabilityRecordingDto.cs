using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordingDto
{
    public Guid Id { get; set; }
    public string CompanyProfileName { get; set; }
    public string Code { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreationTime { get; set; }
    public string CurrentStepName { get; set; }
}