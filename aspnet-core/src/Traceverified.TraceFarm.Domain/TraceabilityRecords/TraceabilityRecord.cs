using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecord : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid ProcessId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string Code { get; set; }

    /// <summary>
    ///     TraceabilityRecordEnum: Recording = 1, Done = 5,
    /// </summary>
    public int Status { get; set; }

    public Guid? CurrentStepId { get; set; }
    public Guid? TenantId { get; set; }
}