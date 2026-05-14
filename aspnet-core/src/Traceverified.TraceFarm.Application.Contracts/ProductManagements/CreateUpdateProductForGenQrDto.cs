using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProductManagements;

public class CreateUpdateProductForGenQrDto: CreateUpdateProductDto
{
    public Guid TenantId { get; set; }
    public Guid? CompanyId { get; set; }
}