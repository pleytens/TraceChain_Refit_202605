using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.Companies;

public class CompanyProfileFilterDto : RequestCustomDto
{
    public Guid? MarketId { get; set; }
    public Guid? ProductCategoryId { get; set; }
}