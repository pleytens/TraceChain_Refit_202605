using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class ProcessRecordFilterDto : RequestCustomDto
{
    public List<Guid>? CreatedBy { get; set; }
    public List<Guid>? ProcessIds { get; set; }
    public DateTime? CreationDateStart { get; set; }
    public DateTime? CreationDateEnd { get; set; }
}