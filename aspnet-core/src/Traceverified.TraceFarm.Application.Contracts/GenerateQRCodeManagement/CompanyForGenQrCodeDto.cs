using System;
using Traceverified.TraceFarm.Companies;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public class CompanyForQrCodeDto : CompanyDto
{
    public string Description { get; set; }
    public Guid CompanyProfileId { get; set; }
    
    public string? UpdateToken { get; set; }
}