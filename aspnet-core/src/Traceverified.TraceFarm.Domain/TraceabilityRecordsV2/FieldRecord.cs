using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

/// <summary>
///     This table will manage by multi key (StepRecordId, EntityId, EntityType)
///     EntityType: 1 = Reception, 5 = Origin => entityId = Record Reception v2 table, 10 = StepRecord => entity = null, 15
///     = ShareWithPartner => entityId = Record Share table
/// </summary>
public class FieldRecord : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid StepRecordId { get; set; }
    public Guid? EntityId { get; set; }
    public int EntityType { get; set; }
    public Guid ProcessFieldId { get; set; }
    public string ResponseText { get; set; }

    /// <summary>
    ///     If Field Data type >= 10 and <= 19, this field will get data from table match with Data type
    ///     Else this field will get data from ProcessFieldOption table
    /// </summary>
    public Guid ProcessFieldOptionId { get; set; }

    public bool? Selected { get; set; }
    public Guid? ExecutorId { get; set; }
    public Guid? TenantId { get; set; }
}