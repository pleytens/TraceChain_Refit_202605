using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProcessManagements;

public class CreateUpdateFieldOptionDto
{
    public Guid Id { get; set; }

    [Required] public Guid StepId { get; set; }

    [Required] public string Name { get; set; }

    [Required] public int DataType { get; set; }

    [Required] public bool IsObligatory { get; set; }

    [Required] public int Position { get; set; }
    [NotMapped] public List<CreateUpdateOptionDto>? Options { get; set; }
    public Guid? TenantId { get; set; }
}

public class CreateUpdateOptionDto
{
    public Guid Id { get; set; }
    public string OptionValue { get; set; }
    public Guid? TenantId { get; set; }
}