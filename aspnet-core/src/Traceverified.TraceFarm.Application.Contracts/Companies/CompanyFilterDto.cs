using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.Companies;

public class CompanyFilterDto : RequestCustomDto
{
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? WardId { get; set; }
}