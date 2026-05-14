using System;
using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Companies;

public class CreateUpdateCompanyDto
{
    public string? Logo { get; set; }

    [Required] public string GS1Code { get; set; }

    [Required] public string Name { get; set; }

    [Required] [EmailAddress] public string EmailAddress { get; set; }

    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }

    [Required] public Guid NationId { get; set; }

    [Required] public Guid ProvinceId { get; set; }

    [Required] public Guid DistrictId { get; set; }

    [Required] public Guid WardId { get; set; }

    public string? WebsiteUrl { get; set; }
    public string? Description { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid? TenantId { get; set; } // tenant id
    [Required] public string TenantName { get; set; } // tenant name
    [Required] [EmailAddress] public string AdminEmailAddress { get; set; } // tenant admin email
    [Required] public string AdminPassword { get; set; } // tenant admin password

    public bool? IsActive { get; set; } = false;

}