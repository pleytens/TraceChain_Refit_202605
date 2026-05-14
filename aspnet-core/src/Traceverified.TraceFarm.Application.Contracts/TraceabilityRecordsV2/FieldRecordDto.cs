using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traceverified.TraceFarm.ProcessManagements;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class FieldRecordDto
{
    public FieldRecordDto()
    {
        Options = new List<ProcessFieldOptionResponseDto>();
    }

    public Guid Id { get; set; }
    public Guid ProcessFieldId { get; set; }
    public string Name { get; set; }
    public int DataType { get; set; }
    public bool IsObligatory { get; set; }
    public int Position { get; set; }
    public Guid StepRecordId { get; set; }
    public List<ProcessFieldOptionResponseDto> Options { get; set; }

    [NotMapped] public Guid? ExecutorId { get; set; }
}