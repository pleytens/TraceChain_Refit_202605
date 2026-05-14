using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProductManagements;

public class Product : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string GtinCode { get; set; }
    public string ProductName { get; set; }
    public Guid MarketId { get; set; }
    public Guid ProductCategoryId { get; set; }
    public string Link { get; set; }
    public string Description { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? CompanyId { get; set; }
}