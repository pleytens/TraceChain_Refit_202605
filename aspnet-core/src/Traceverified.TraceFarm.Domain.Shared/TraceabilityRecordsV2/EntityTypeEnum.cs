namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

/// <summary>
///     Reception, Origin: Get data from Record Reception V2 Table
///     ShareWithPartner: Get data from Record Share table
///     StepRecord: Get data from Record Step table
/// </summary>
public enum EntityTypeEnum
{
    None = 0,
    Reception = 1,
    Origin = 5,
    StepRecord = 10,
    ShareWithPartner = 15
}