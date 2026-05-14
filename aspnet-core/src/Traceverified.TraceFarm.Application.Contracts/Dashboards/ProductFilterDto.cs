using System;

namespace Traceverified.TraceFarm.Dashboards;

public class ProductFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? IsExpired { get; set; }
    public int? QuantityToTake { get; set; }
}