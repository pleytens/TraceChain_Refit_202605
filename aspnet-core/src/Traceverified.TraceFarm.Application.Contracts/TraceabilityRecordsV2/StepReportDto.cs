using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class StepReportDto
{
    public StepReportDto()
    {
        EntityCodes = new List<string>();
    }

    public Guid Id { get; set; }
    public string Code { get; set; }
    public string? RecordStatus { get; set; }
    public int RecordStatusEnumValue { get; set; }
    public Guid ProcessStepId { get; set; }

    [NotMapped] public List<string> EntityCodes { get; set; }

    public List<StepRecordDropdownDto>? StepRecordCodeUsed { get; set; }
    public string? EntityCodeStr { get; set; }
    public string? ReceptionOrOrigin { get; set; }

    /// <summary>
    ///     Format created username (dd-MM-yyy HH:mm)
    /// </summary>
    public string CreatedBy { get; set; }

    public DateTime CreationTime { get; set; }

    /// <summary>
    ///     Format: Last modified username (dd-MM-yyy HH:mm)
    /// </summary>
    public string LastModifiedBy { get; set; }

    public int UseAll { get; set; }
    public bool IsEditEnabled { get; set; } = true;
}