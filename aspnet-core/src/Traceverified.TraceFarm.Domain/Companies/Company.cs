using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Companies;

public class Company : FullAuditedAggregateRoot<Guid>
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
    public string? WebsiteUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid TenantId { get; set; }
    public bool? IsActive { get; set; }
}