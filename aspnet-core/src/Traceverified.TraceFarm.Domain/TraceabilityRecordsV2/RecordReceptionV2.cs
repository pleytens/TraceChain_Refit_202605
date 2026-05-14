using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class RecordReceptionV2 : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid StepRecordId { get; set; }
    public int ReceptionType { get; set; }
    public Guid? RecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }

    public Guid? TenantId { get; set; }
}