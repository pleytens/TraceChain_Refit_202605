using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public class GenerateQrCodeDto
{
    [Required]
    public string CompanyLogo { get; set; }
    
    [Required]
    public string GS1Code { get; set; }
    [Required]
    public string Name { get; set; }
    [Required]
    public string EmailAddress { get; set; }
    
    [Required]
    public string? PhoneNumber { get; set; }
    
    [Required]
    public string? Address { get; set; }
    
    [Required]
    public Guid NationId { get; set; }
    [Required]
    public Guid ProvinceId { get; set; }
    [Required]
    public Guid DistrictId { get; set; }
    [Required]
    public Guid WardId { get; set; }

    [NotMapped] public List<string>? CompanyCertificationImages { get; set; }
    
    public string? WebsiteUrl { get; set; }
    public Guid TenantId { get; set; }

    public string CompanyDescription { get; set; }

    [Required]
    public string ProductGTINCode { get; set; }
    [Required]
    public string ProductName { get; set; }
    [Required]
    public string ProductDescription { get; set; }
    [Required]
    public Guid ProductCategoryId { get; set; }
    [NotMapped] public List<string>? ProductImages { get; set; }

    [NotMapped] public List<string>? ProductCertificationImages { get; set; }
}