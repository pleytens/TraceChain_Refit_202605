using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordFilterDto : RequestCustomDto
{
    public Guid? CompanyProfileId { get; set; }
    public Guid? ProcessId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }

    /// <summary>
    ///     TraceabilityRecordEnum: Recording = 1, Done = 5,
    /// </summary>
    public int Status { get; set; }
}