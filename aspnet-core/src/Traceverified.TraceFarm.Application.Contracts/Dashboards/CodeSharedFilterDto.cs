using System;

namespace Traceverified.TraceFarm.Dashboards;

public class CodeSharedFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? PartnerId { get; set; }
}