using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepReportReceivedDto
{
    public Guid Id { get; set; }

    public Guid? PartnerId { get; set; }
    public string RecordCode { get; set; }
    public string TraceabilityCode { get; set; }
    public int NumberOfStamps { get; set; }
    public string ProductName { get; set; }
    public string? LotId { get; set; }

    /// <summary>
    ///     This is Company Profile Name
    /// </summary>
    public string PartnerName { get; set; }

    public string SharedBy { get; set; }

    public DateTime CreationTime { get; set; }
    public string? ViewTraceabilityUrl { get; set; }
    public string? ViewTraceabilityUrlFull { get; set; }
}