using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CreateUpdateStepReportNormalDto
{
    // public List<Guid> RecordCodeIds { get; set; }
    // public int UseAll { get; set; }
    public Guid? StepReportId { get; set; }
    public Guid ProcessStepId { get; set; }
    public bool RecordStatus { get; set; }
    public List<FieldRecordDto> FieldRecords { get; set; }
    public List<RecordCodeSelectedDto>? RecordCodeSelected { get; set; }
}

public class RecordCodeSelectedDto
{
    public Guid RecordCodeId { get; set; }
    public string Name { get; set; }
    public bool UseAll { get; set; }
}