using System;
using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Stamps;

public class CreateUpdateStampDto
{
    [Required] 
    public Guid CompanyId { get; set; }

    [Required] 
    public int StartLotNumber { get; set; }

    [Required] 
    public int EndLotNumber { get; set; }

    [Required] public int Quantity { get; set; }
    public string? Note { get; set; }
}