using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.ProductCategories;

public class ProductCategory : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; }
}