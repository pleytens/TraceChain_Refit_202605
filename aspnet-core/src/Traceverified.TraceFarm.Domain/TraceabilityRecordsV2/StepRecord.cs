using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

/// <summary>
///     Create when a step recording is called
/// </summary>
public class StepRecord : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    /// <summary>
    ///     Equal 00000 + Process step position + count Step Record of this process step +1
    /// </summary>
    public string Code { get; set; }

    public int RecordStatus { get; set; }

    public Guid ProcessStepId { get; set; }

    // this field will update well next step set use all = 1
    public int UseAll { get; set; }
    public Guid? TenantId { get; set; }
}