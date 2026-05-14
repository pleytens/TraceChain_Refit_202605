using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordShareDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string ProductName { get; set; }
    public string TraceabilityCode { get; set; }
    public string SharedBy { get; set; }
    public string PartnerName { get; set; }
    public Guid? PartnerId { get; set; }
    public DateTime SendDate { get; set; }
    public string? ContractNumber { get; set; }
}