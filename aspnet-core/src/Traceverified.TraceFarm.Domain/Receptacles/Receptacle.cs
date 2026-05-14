using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Receptacles;

public class Receptacle : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Code { get; set; }
    public string Description { get; set; }
    public Guid? TenantId { get; set; }
}