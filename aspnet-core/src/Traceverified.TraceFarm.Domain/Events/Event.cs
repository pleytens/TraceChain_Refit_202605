using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Events;

public class Event : FullAuditedAggregateRoot<Guid>,IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Title { get; set; }
    public string? Slug { get; set; }
    public string? ShortDescription { get; set; }
    public string? Content { get; set; }
    public int Status { get; set; }
    public Guid GroupId { get; set; } = Guid.Empty;
    public string Language { get; set; } = nameof(LanguageEnum.vi);
    // public string AuthorName { get; set; }
    public string CoverImageName { get; set; }
    public int Views { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int EventType { get; set; }
    public string? Code { get; set; } = string.Empty;
    public Guid? ProductId { get; set; } = null;
}