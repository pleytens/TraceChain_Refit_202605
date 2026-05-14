using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Partners;

public class PartnerDto : AuditedEntityDto<Guid>
{
    public string Gs1Code { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public Guid? NationId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? WardId { get; set; }
    public string? Website { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public Guid? CompanyId { get; set; }
}