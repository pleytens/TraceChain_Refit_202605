using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecords.Reports;

public class DiaryReportDto
{
    public DiaryReportDto()
    {
        MaterialTraceCode = new List<string>();
        Steps = new List<DiaryReportStepDto>();
    }

    public List<string> MaterialTraceCode { get; set; }
    public List<DiaryReportStepDto> Steps { get; set; }
}

public class DiaryReportStepDto
{
    public string StepName { get; set; }
    public DateTime RecordDate { get; set; }
    public List<FieldRecordReportDto> FieldRecords { get; set; }
}

public class FieldRecordReportDto
{
    public string FieldName { get; set; }
    public string? ResponseText { get; set; }
    public int DataType { get; set; }
}