using System;
using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Partners;

public class CreateUpdatePartnerDto
{
    [Required] public string Name { get; set; }

    [Required] public string Gs1Code { get; set; }

    [Required] public string Address { get; set; }

    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }

    [Required] public Guid NationId { get; set; }

    [Required] public Guid ProvinceId { get; set; }

    [Required] public Guid DistrictId { get; set; }

    [Required] public Guid WardId { get; set; }

    public string? Website { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? CompanyId { get; set; }
}