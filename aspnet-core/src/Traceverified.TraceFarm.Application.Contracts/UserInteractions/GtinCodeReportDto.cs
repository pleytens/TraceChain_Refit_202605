using System;

namespace Traceverified.TraceFarm.UserInteractions;

public class GtinCodeReportDto
{
    public DateTime? ScanDate { get; set; }
    public string TraceabilityCode { get; set; } = string.Empty;
    public long NumberOfScans { get; set; } = 0;
    public int NumberOfDevices { get; set; } = 0;
    public Guid Id { get; set; } = Guid.Empty;
}