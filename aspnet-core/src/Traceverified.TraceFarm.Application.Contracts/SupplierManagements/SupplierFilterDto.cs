using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.SupplierManagements;

public class SupplierFilterDto : RequestCustomDto
{
    public Guid? NationId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? WardId { get; set; }
}