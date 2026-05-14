using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

/// <summary>
///     use for step normal and share with partner
/// </summary>
public class EntityStepRecord : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    /// <summary>
    ///     EntityTypeEnum: None = 0, Reception = 1, Origin = 5, StepRecord = 10, ShareWithPartner = 15
    /// </summary>
    public int EntityTypeId { get; set; }

    public Guid? EntityValue { get; set; }
    public Guid StepRecordId { get; set; }
    public int UseAll { get; set; }
    public Guid? TenantId { get; set; }
}