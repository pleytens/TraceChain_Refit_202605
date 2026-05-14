using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.SupplierManagements;

public class Supplier : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public Guid NationId { get; set; }
    public Guid ProvinceId { get; set; }
    public Guid DistrictId { get; set; }
    public Guid WardId { get; set; }
    public Guid? TenantId { get; set; }
}