using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Companies;

public class CreateUpdateReceptacleDto
{
    [Required] public string Code { get; set; }
    public string? Description { get; set; }
}