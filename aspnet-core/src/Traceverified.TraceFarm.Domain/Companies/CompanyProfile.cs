using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Companies;

public class CompanyProfile : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }
    public Guid MarketId { get; set; }
    public Guid ProductCategoryId { get; set; }
    public string CompanyName { get; set; }
    public string Description { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? CompanyId { get; set; }
}