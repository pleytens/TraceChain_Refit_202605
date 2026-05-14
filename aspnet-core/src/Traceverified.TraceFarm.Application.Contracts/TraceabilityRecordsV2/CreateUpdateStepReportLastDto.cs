using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CreateUpdateStepReportLastDto
{
    public CreateUpdateRecordShareDto RecordShare { get; set; }
    public Guid? StepReportId { get; set; }
    public Guid ProcessStepId { get; set; }

    public bool RecordStatus { get; set; }

    public List<RecordCodeSelectedDto>? RecordCodeSelected { get; set; }
    public List<FieldRecordDto> FieldRecords { get; set; }
    public string? LotId { get; set; }
}