using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class RecordReception : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid TraceabilityRecordId { get; set; }
    public Guid ProcessStepId { get; set; }
    public int ReceptionType { get; set; }
    public Guid? TraceabilityRecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? TenantId { get; set; }
}