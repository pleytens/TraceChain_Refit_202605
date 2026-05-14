using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Companies;

public class CompanyDto : AuditedEntityDto<Guid>
{
    public string? Logo { get; set; }
    public string GS1Code { get; set; }
    public string Name { get; set; }
    public string EmailAddress { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public Guid NationId { get; set; }
    public Guid ProvinceId { get; set; }
    public Guid DistrictId { get; set; }
    public Guid WardId { get; set; }
    [NotMapped]
    public string? NationName { get; set; }
    [NotMapped]
    public string? ProvinceName { get; set; }
    [NotMapped]
    public string? DistrictName { get; set; }
    [NotMapped]
    public string? WardName { get; set; }
    
    public string? WebsiteUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid TenantId { get; set; }
    [NotMapped]
    public string TenantName { get; set; } // tenant name
    [NotMapped]
    public string AdminEmailAddress { get; set; } // tenant admin email
    [NotMapped]
    public string AdminPassword { get; set; } // tenant admin password
    [NotMapped]
    public string UserName { get; set; }

    [NotMapped] public string? ImageUrl { get; set; }
    public bool? IsActive { get; set; }
}