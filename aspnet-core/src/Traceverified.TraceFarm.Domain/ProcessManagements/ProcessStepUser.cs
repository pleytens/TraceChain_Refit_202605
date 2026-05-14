using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStepUser : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid ProcessStepId { get; set; }
    public Guid UserId { get; set; }
    public string? Note { get; set; }
    public Guid? TenantId { get; set; }
}