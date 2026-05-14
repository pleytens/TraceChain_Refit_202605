using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.ProcessManagements;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class CreateUpdateRecordResponseDto
{
    public Guid TraceabilityRecordId { get; set; }
    public Guid ProcessStepId { get; set; }
    public Guid? EntityValue { get; set; }
    public int EntityType { get; set; }
    public Guid? ProcessStepResponseId { get; set; }
    public List<ProcessFieldResponseDto> FieldResponses { get; set; }

    // [NotMapped] 
    public bool IsDone { get; set; }
    public int Status { get; set; }
}