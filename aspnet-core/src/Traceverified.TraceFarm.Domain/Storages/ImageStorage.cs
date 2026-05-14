using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Storages;

public class ImageStorage : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid RelatedEntityId { get; set; }
    public int RelatedEntityType { get; set; }
    public string ImageName { get; set; } = string.Empty;
    public string? ImageNameRaw { get; set; }
    public string? Description { get; set; }
    public Guid? TenantId { get; set; }
    public int? Status { get; set; }
}