using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.ProductManagements;

namespace Traceverified.TraceFarm.TraceabilityRecords.Reports;

public class ProductReportDto
{
    public ProductReportDto()
    {
        Images = [];
        CertificationImages = [];
        VideoUrls = [];
    }

    public string ProductName { get; set; }
    public Guid ProductId { get; set; }
    public string GtinCode { get; set; }
    public string Description { get; set; }
    public List<string> Images { get; set;  }
    public List<string> VideoUrls { get; set; }
    public List<string> CertificationImages { get; set; }
    public string ActivationDate { get; set; }
    public string CompanyLogo { get; set; }
    public List<ProductDocumentFileDto>? DocumentFiles { get; set; } = [];
}