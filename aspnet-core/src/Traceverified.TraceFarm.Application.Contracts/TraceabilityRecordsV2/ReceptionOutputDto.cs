using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class ReceptionOutputDto
{
    public Guid ReceptionId { get; set; }
    public int ReceptionType { get; set; }
    public Guid? TraceabilityRecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
}