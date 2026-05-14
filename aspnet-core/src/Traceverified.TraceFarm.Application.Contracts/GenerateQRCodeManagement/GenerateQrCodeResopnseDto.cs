using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public class GenerateQrCodeResponseDto :GenerateQrCodeDto
{
    public string UpdateToken { get; set; }
    
    public Guid ProductId { get; set; }
    public Guid CompanyId { get; set; }
    public Guid CompanyProfileId { get; set; }
}