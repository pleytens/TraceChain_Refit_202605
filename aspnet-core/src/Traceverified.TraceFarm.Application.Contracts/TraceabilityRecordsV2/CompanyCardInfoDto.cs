using System;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class CompanyCardInfoDto
{
    public Guid CompanyProfileId { get; set; } = Guid.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public DateTime? CreatedTime { get; set; }
    public string? Address { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty; 
    public string? TraceabilityCode { get; set; } = string.Empty;
}