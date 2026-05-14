using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordReceivedDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string ProductName { get; set; }
    public string TraceabilityCode { get; set; }
    public string SharedBy { get; set; }
    public string PartnerName { get; set; }
    public DateTime ReceivedDate { get; set; }
}