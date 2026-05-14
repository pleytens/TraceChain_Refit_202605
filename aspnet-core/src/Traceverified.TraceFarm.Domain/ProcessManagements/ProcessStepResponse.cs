using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStepResponse : FullAuditedAggregateRoot<Guid>
{
    public Guid ProcessStepId { get; set; }

    /// <summary>
    ///     ProcessStepResponseEnum: None = 0, Reception = 1, Origin = 5
    /// </summary>
    public int EntityTypeId { get; set; }

    public Guid? EntityValue { get; set; }
    public Guid? TraceabilityRecordId { get; set; }
    public bool IsDone { get; set; } = false;
}