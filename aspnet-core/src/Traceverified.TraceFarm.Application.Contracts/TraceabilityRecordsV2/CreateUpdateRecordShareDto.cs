using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CreateUpdateRecordShareDto
{
    public List<Guid> RecordCodeIds { get; set; }
    public List<RecordCodeSelectedDto> RecordCodeSelected { get; set; }
    public int UseAll { get; set; }
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public Guid? PartnerId { get; set; }
    public int NumberOfStamp { get; set; }
    public int StartNumber { get; set; }
    public int EndNumber { get; set; }
    public string? LotId { get; set; }
}