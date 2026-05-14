using System;
using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.SupplierManagements;

public class CreateUpdateSupplierDto
{
    [Required] public string Code { get; set; }
    [Required] public string Name { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    [Required] public Guid NationId { get; set; }
    [Required] public Guid ProvinceId { get; set; }
    [Required] public Guid DistrictId { get; set; }
    [Required] public Guid WardId { get; set; }
}