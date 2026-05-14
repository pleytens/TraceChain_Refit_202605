using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string? Note { get; set; }

    public bool IdEditable { get; set; }

    [NotMapped] public string? ImageBase64 { get; set; }

    [NotMapped] public string? LogoImage { get; set; }
}

public class ProcessMobileDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string? Note { get; set; }

    [NotMapped] public string? ImageUrl { get; set; }
}