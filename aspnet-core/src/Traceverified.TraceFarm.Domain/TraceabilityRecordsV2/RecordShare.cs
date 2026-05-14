using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

// todo: update field follow the new design v2
public class RecordShare : FullAuditedAggregateRoot<Guid>
{
    public Guid StepRecordId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? SourceTenantId { get; set; }
    public Guid? SharedTenantId { get; set; }
    public Guid? PartnerId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public int NumberOfStamp { get; set; }

    /// <summary>
    ///     Equal Max end number of company + 1
    /// </summary>
    public int StartNumber { get; set; }

    /// <summary>
    ///     Equal StartNumber + NumberOfStamp
    /// </summary>
    public int EndNumber { get; set; }

    public string? LotId { get; set; }

    /// <summary>
    ///     use to traceability generate from GS1... (Wait to confirm), generate when save data
    /// </summary>
    public string TraceabilityCode { get; set; }

    /// <summary>
    ///     TraceabilityRecordShareEnum.status: Shared = 1, Locked = 5
    /// </summary>
    public int Status { get; set; }
}