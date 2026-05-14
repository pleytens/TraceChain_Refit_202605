using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Companies;

public class CompanyProfileDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public Guid MarketId { get; set; }
    public string MarketName { get; set; }
    public Guid ProductCategoryId { get; set; }
    public string ProductCategoryName { get; set; }
    public string CompanyName { get; set; }
    public string Description { get; set; }
    public Guid? CompanyId { get; set; }
    [NotMapped] public List<string> CertificateImages { get; set; }
    [NotMapped] public List<string>? CertificateImagesBase64 { get; set; }
}