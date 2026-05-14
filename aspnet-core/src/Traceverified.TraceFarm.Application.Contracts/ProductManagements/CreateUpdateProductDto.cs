using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProductManagements;

public class CreateUpdateProductDto
{
    [Required] public string GtinCode { get; set; }

    [Required] public string ProductName { get; set; } = string.Empty;

    [Required] public Guid MarketId { get; set; }

    [Required] public Guid ProductCategoryId { get; set; }

    public string Link { get; set; } = string.Empty;
    public string Description { get; set; }= string.Empty;

    [NotMapped] public List<string>? Images { get; set; }
    [NotMapped] public List<string>? VideoUrls { get; set; }
    [NotMapped] public List<string>? CertificationImages { get; set; }
    [NotMapped] 
    public List<string>? CertificationVideoUrls { get; set; }
    [NotMapped] 
    public List<Guid>? DocumentFiles { get; set; }
    
}