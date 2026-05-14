using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProductCategories;

public class ProductCategoryDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }

    public int ProductCount { get; set; }
}