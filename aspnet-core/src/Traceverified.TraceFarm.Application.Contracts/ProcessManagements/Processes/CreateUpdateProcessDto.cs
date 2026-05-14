using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProcessManagements;

public class CreateUpdateProcessDto
{
    [Required] public string Name { get; set; }

    public string Note { get; set; }

    [NotMapped] public string? LogoImage { get; set; }
}