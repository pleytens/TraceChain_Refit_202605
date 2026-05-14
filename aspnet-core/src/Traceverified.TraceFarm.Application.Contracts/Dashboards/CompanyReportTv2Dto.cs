using System;

namespace Traceverified.TraceFarm.Dashboards;

public class CompanyReportTv2Dto
{
    public string Name { get; set; }
    public string GS1Code { get; set; }
    public string? Address { get; set; }
    public string Country { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? WebsiteUrl { get; set; }
    public string LogoUrl { get; set; }
    public string? Logo { get; set; }
    public DateTime ParticipationDate { get; set; }
    public int ExpirationDate { get; set; }
}