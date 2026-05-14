using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProductManagements;

public class ProductDto : AuditedEntityDto<Guid>
{
    public string GtinCode { get; set; }
    public string ProductName { get; set; }
    public Guid MarketId { get; set; }
    public string MarketName { get; set; }
    public Guid ProductCategoryId { get; set; }
    public string ProductCategoryName { get; set; }
    public string Link { get; set; }
    public string Description { get; set; }
    public Guid? CompanyId { get; set; }
    [NotMapped] 
    public List<string> CertificateImagesBase64 { get; set; }
    [NotMapped]
    public List<string> CertificateImagesUrls { get; set; } = [];
    [NotMapped]
    public List<string> CertificateImagesName { get; set; } = [];
    [NotMapped]
    public List<ProductDocumentFileDto>? DocumentFiles { get; set; } = [];
    [NotMapped] 
    public List<string> ImagesBase64 { get; set; }
    [NotMapped] 
    public List<string> ImagesUrls { get; set; } = [];
    [NotMapped] 
    public List<string> ImagesName { get; set; } = [];
    [NotMapped]
    public List<string> VideoUrls { get; set; }
}