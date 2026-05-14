using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.Stamps;

public class StampFilterDto
{
    public int SkipCount { get; set; } = 0;
    public int MaxResultCount { get; set; } = 0;
    public string? Sorting { get; set; }
    public string? Filter { get; set; }
    public IList<Guid> CompanyIds { get; set; } = new List<Guid>();
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}