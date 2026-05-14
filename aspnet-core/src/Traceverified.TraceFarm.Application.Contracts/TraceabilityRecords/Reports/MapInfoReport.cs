using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecords.Reports;

public class MapInfoReport
{
    public int Position { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string DisplayText { get; set; }
}

public class MapInfoReportV2
{
    public MapInfoReportV2()
    {
        MapInfoReports = new List<MapInfoReportV2>();
    }

    public bool IsArea { get; set; } = false;
    public bool IsGetCompanyInfo { get; set; } = false;
    public int Position { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string DisplayText { get; set; }
    public string? RedirectUrl { get; set; }
    public Guid CompanyProfileId { get; set; } = Guid.Empty;
    public Guid ProductId { get; set; } = Guid.Empty;
    public string? TraceabilityCode { get; set; }
    public DateTime? CreatedTime { get; set; }
    public List<MapInfoReportV2>? MapInfoReports { get; set; }
}