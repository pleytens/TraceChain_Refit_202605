using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.TraceabilityRecords.Reports;

public class CompanyReportDto
{
    public CompanyReportDto()
    {
        CertificationImages = new List<string>();
    }

    public string Name { get; set; }
    public string GS1Code { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string Country { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? WebsiteUrl { get; set; }
    public List<string> CertificationImages { get; set; }
    public Guid TenantId { get; set; }
}