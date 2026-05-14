using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldOption : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid ProcessFieldId { get; set; }
    public string OptionValue { get; set; }
    public Guid? TenantId { get; set; }
}