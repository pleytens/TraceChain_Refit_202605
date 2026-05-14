using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ReportTemplates;

public class ReportTemplate : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }
    public string? Description { get; set; }

    /// <summary>
    ///     Government 1, Buyer 5, Consumer 10
    /// </summary>
    public int UserType { get; set; }

    /// <summary>
    ///     Allow to show front node on the map
    /// </summary>
    public bool? AllowShowFrontNode { get; set; }

    /// <summary>
    ///     Allow Full information
    /// </summary>
    public bool? AllowShowFullInfo { get; set; }

    /// <summary>
    ///     Only show area
    /// </summary>
    public bool? AllowOnlyArea { get; set; }

    /// <summary>
    ///     Allow to show follow node on the map
    /// </summary>
    public bool? AllowShowFollowNode { get; set; }

    /// <summary>
    ///     Allow to show link to material document on the report
    /// </summary>
    public bool? AllowShowLink { get; set; }

    public Guid? TenantId { get; set; }
}