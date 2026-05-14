using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessField : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid StepId { get; set; }
    public string Name { get; set; }
    public int DataType { get; set; }
    public bool IsObligatory { get; set; }
    public int Position { get; set; }
    public Guid? TenantId { get; set; }
}