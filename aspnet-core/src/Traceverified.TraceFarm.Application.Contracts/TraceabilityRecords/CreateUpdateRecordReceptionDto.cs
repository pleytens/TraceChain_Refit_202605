using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class CreateUpdateRecordReceptionDto
{
    public Guid Id { get; set; }

    public Guid TraceabilityRecordId { get; set; }
    public Guid ProcessStepId { get; set; }
    public int ReceptionType { get; set; }
    public Guid? TraceabilityRecordSharedId { get; set; }
    public Guid? CountryId { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
}