using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.CompanyTraceabilityReports;

public class CompanyTraceabilityReportFilter : RequestCustomDto
{
    public Guid? CompanyId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}