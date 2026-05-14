using System;

namespace Traceverified.TraceFarm.Stamps;

public class StampExportDto
{
    public string CreatedDate { get; set; }
    public string CompanyName { get; set; }
    public string QRCode { get; set; }
    public string TraceUrl { get; set; }
    public string? Note { get; set; }
}