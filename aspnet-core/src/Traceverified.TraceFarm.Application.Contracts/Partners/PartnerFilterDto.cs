using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.Partners;

public class PartnerFilterDto : RequestCustomDto
{
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? WardId { get; set; }
    public Guid? NationId { get; set; }
}