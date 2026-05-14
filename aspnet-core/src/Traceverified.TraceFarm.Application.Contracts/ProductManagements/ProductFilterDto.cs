using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.ProductManagements;

public class ProductFilterDto : RequestCustomDto
{
    public Guid? MarketId { get; set; }
    public Guid? ProductCategoryId { get; set; }
}