using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.Companies;

public class CreateUpdateCompanyProfileDto
{
    [Required] public string Name { get; set; }

    [Required] public Guid MarketId { get; set; }

    [Required] public Guid ProductCategoryId { get; set; }

    public string CompanyName { get; set; }
    public string Description { get; set; }
    public List<string>? CertificateImages { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? CompanyId { get; set; }
}