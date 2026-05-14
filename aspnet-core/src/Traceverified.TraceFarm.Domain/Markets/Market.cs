using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Markets;

public class Market : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; }
    public bool? IsDefaultForFree { get; set; } = false;
}