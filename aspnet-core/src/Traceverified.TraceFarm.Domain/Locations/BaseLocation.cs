using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Locations;

public class BaseLocation : FullAuditedAggregateRoot<Guid>
{
    public string? Alias { get; set; }

    public int SortOrder { get; set; }
    public string OriginalName { get; set; }
    public string OriginalLanguage { get; set; }
    public bool IsPublished { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}