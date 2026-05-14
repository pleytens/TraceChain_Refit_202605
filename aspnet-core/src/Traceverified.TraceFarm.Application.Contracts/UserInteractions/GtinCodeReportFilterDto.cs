using System;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.UserInteractions;

public class GtinCodeReportFilterDto: RequestCustomDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? ProductId { get; set; } = Guid.Empty;
}