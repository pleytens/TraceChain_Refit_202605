using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldDto : AuditedEntityDto<Guid>
{
    public Guid StepId { get; set; }
    public string Name { get; set; }
    public int DataType { get; set; }
    public bool IsObligatory { get; set; }
    public int Position { get; set; }

    [NotMapped] public List<ProcessFieldOptionDto>? Options { get; set; }
}