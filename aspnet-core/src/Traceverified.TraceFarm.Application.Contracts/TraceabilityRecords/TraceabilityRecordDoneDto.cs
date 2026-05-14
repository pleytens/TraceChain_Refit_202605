using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.Share;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordDoneDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public List<DropdownItemBaseDto> Products { get; set; }
    public List<DropdownItemBaseDto> TraceabilityCodes { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreationTime { get; set; }

    public string? ViewTraceabilityUrl { get; set; }
}