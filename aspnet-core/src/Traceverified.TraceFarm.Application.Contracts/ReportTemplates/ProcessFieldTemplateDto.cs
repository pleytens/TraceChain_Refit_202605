using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ReportTemplates;

public class ProcessFieldTemplateDto : FullAuditedEntityDto<Guid>
{
    public Guid ProcessFieldId { get; set; }
    public Guid ReportTemplateId { get; set; }
}