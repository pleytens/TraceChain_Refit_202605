using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProductManagements;

public class ProductExpirationTime: FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public DateTime ExpirationTime { get; set; }
    public Guid ProductId { get; set; }
}