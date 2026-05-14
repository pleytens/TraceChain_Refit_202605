namespace Traceverified.TraceFarm.ProcessManagements;

public enum ProcessStepResponseEnum
{
    None = 0,
    RecordReception = 1,
    TraceabilityRecordShare = 5
}

public enum ProcessStepResponseStatusEnum
{
    Recording = 1,
    Done = 5,
    Sold = 10
}