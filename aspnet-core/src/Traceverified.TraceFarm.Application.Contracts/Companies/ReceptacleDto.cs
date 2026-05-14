using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Companies;

public class ReceptacleDto : AuditedEntityDto<Guid>
{
    public string Code { get; set; }
    public string? Description { get; set; }
}