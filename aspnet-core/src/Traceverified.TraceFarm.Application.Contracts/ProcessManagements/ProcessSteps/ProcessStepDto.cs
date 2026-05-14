using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStepDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string? Description { get; set; }

    [NotMapped] public string ReceptacleCode { get; set; }

    public Guid? ReceptacleId { get; set; }
    public Guid ProcessId { get; set; }

    [NotMapped] public int QuestionCount { get; set; }

    // [NotMapped] public List<string> UserTagIds { get; set; }
    [NotMapped] public List<ProcessStepUserDto> UserTags { get; set; }
    public int? IsSpecial { get; set; }
    public Guid? TenantId { get; set; }
    public int Position { get; set; } = 0;
}

public class ProcessStepUserDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
}