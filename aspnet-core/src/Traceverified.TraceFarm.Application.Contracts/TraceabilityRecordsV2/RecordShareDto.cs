using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class RecordShareDto
{
    public RecordShareDto()
    {
        StepRecordCodeUsed = new List<DropdownItemBaseDto>();
    }

    public Guid Id { get; set; }
    public string TraceabilityCode { get; set; }
    public string ProductName { get; set; }
    public string ProfileName { get; set; }
    public string CreatedBy { get; set; }
    public string? LotId { get; set; }
    [NotMapped] public List<DropdownItemBaseDto>? StepRecordCodeUsed { get; set; }
}