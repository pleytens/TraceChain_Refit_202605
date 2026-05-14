using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStep : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public Guid? ReceptacleId { get; set; }
    public Guid ProcessId { get; set; }
    public int? IsSpecial { get; set; }
    public int Position { get; set; } = 0;
    public Guid? TenantId { get; set; }
}