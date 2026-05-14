using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepReportFilterDto : RequestCustomDto
{
    public List<int>? StepStatus { get; set; }
    public List<Guid?>? CreatedBy { get; set; }
    public Guid ProcessStepId { get; set; }
    public DateTime? CreationDateStart { get; set; }
    public DateTime? CreationDateEnd { get; set; }
}