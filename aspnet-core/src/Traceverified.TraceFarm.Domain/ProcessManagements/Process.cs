using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProcessManagements;

public class Process : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }
    public string? Note { get; set; }
    public Guid? TenantId { get; set; }
}