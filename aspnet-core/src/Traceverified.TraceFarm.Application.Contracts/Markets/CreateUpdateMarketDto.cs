using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Markets;

public class CreateUpdateMarketDto
{
    [Required] public string Name { get; set; }
    public bool? IsDefaultForFree { get; set; }
}