using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepReportDoneDto
{
    public Guid Id { get; set; }

    public Guid? PartnerId { get; set; }
    public string RecordCode { get; set; }
    public string TraceabilityCode { get; set; }
    public string ProductName { get; set; }
    public string ProfileName { get; set; }
    public string CreatedBy { get; set; }
    public string LastModifiedBy { get; set; }
    public string ViewTraceabilityUrl { get; set; }
    public string? ViewTraceabilityUrlFull { get; set; }
    public bool IsBackEnabled { get; set; } = false;
    public DateTime CreationTime { get; set; }
    public int NumberOfStamps { get; set; }
}