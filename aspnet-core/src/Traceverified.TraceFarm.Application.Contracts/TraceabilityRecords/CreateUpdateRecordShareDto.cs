using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

/// <summary>
///     This is TraceabilityRecordShareDto
/// </summary>
public class CreateUpdateRecordShareDto
{
    public Guid TraceabilityRecordId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? SourceTenantId { get; set; }
    public Guid? SharedTenantId { get; set; }
    public int? StartNumber { get; set; }
    public int EndNumber { get; set; }
    public string ContractNumber { get; set; }

    /// <summary>
    ///     use to traceability generate from GS1... (Wait to confirm), generate when save data
    /// </summary>
    public string TraceabilityCode { get; set; }

    /// <summary>
    ///     TraceabilityRecordShareEnum.status: Shared = 1, Locked = 5
    /// </summary>
    public int Status { get; set; }
}