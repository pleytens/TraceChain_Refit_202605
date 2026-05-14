using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepReportDoneFilterDto : RequestCustomDto
{
    public List<Guid>? ProductIds { get; set; }
    public List<Guid>? ProfileIds { get; set; }
    public DateTime? CreationDateStart { get; set; }
    public DateTime? CreationDateEnd { get; set; }
}

public class StepReportShareFilterDto : RequestCustomDto
{
    public List<Guid>? ProductIds { get; set; }
    public List<Guid>? PartnerIds { get; set; }
    public DateTime? CreationDateStart { get; set; }
    public DateTime? CreationDateEnd { get; set; }
}