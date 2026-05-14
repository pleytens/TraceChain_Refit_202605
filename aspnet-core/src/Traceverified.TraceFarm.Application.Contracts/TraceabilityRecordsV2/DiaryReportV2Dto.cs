using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class DiaryReportV2Dto
{
    public DiaryReportV2Dto()
    {
        MaterialTraceCodes = new List<MaterialTraceCodeDto>();
        Steps = new List<DiaryReportStepV2Dto>();
    }

    public List<MaterialTraceCodeDto> MaterialTraceCodes { get; set; }
    public List<DiaryReportStepV2Dto> Steps { get; set; }
}

public class MaterialTraceCodeDto
{
    public string? MaterialTraceCode { get; set; }
    public string? RedirectUrl { get; set; }
}

public class DiaryReportStepV2Dto
{
    public string? LotId { get; set; }
    public string StepName { get; set; }
    public int? StepType { get; set; }
    public DateTime? CreatedTime { get; set; }
    public List<DiaryStepRecordDto> StepRecords { get; set; }
}

public class DiaryStepRecordDto
{
    public string? ReceptionOrOriginFieldName { get; set; }
    public string? ReceptionOrOriginData { get; set; }
    public string StepRecordCode { get; set; }
    public string? RedirectUrl { get; set; }
    public List<DiaryFieldRecordReportDto> FieldRecords { get; set; }
}

public class DiaryFieldRecordReportDto
{
    public string FieldName { get; set; }
    public string? ResponseText { get; set; }
    public int DataType { get; set; }
    public int Position { get; set; }
}

public class DiaryNode
{
    public Guid StepRecordId { get; set; }
    public Guid? RecordReceptionId { get; set; }
    public string StepRecordCode { get; set; }
    public string? ReceptionOrOriginFieldName { get; set; }
    public string? ReceptionOrOriginData { get; set; }
    public string? RedirectUrl { get; set; }
    public Guid ProcessStepId { get; set; }
    public int? IsSpecial { get; set; }
    public string StepName { get; set; }
    public Guid? EntityId { get; set; } = Guid.Empty;
    public DateTime? CreatedTime { get; set; }
    public string? LotId { get; set; }
}