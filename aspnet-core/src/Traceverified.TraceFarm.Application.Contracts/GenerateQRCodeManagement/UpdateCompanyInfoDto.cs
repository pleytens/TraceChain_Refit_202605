using System;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public class UpdateCompanyInfoDto
{
    public string GS1Code { get; set; }
    public string UpdateToken { get; set; }
    public string EmailAddress { get; set; }
    public Guid ProductId { get; set; }
}