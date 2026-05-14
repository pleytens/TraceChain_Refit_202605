using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.Dashboards;

public class CodeSharedPerCusFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? CustomerId { get; set; }
    public List<Guid>? ProductIds { get; set; }
}