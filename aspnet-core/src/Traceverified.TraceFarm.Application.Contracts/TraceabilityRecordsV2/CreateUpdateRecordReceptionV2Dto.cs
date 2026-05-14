using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CreateUpdateRecordReceptionV2Dto
{
    public Guid? Id { get; set; }
    public int ReceptionType { get; set; }
    public Guid? RecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
}