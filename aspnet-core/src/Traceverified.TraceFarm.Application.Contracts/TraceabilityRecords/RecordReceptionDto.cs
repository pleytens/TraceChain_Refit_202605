using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class RecordReceptionDto
{
    public Guid Id { get; set; }

    // public Guid TraceabilityRecordId { get; set; }
    // public Guid ProcessStepId { get; set;}
    public int ReceptionType { get; set; }
    public Guid? TraceabilityRecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public string TraceabilityRecordCode { get; set; }
}