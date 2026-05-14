using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldResponse : FullAuditedAggregateRoot<Guid>
{
    public Guid ProcessFieldId { get; set; }
    public string ResponseText { get; set; }
    public Guid ProcessFieldOptionId { get; set; }
    public bool? Selected { get; set; }
    public Guid ProcessStepResponseId { get; set; }
    public Guid? ExecutorId { get; set; }
}