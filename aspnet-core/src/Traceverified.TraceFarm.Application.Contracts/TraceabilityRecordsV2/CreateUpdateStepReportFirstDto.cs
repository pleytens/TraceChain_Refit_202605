using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CreateUpdateStepReportFirstDto
{
    public Guid? StepReportId { get; set; }
    public Guid ProcessStepId { get; set; }
    public bool RecordStatus { get; set; }
    public CreateUpdateRecordReceptionV2Dto Reception { get; set; }
    public List<FieldRecordDto> FieldRecords { get; set; }
}