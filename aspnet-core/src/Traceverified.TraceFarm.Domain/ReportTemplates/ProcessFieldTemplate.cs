using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.ReportTemplates;

public class ProcessFieldTemplate : FullAuditedAggregateRoot<Guid>
{
    public Guid ReportTemplateId { get; set; }
    public Guid ProcessFieldId { get; set; }
}