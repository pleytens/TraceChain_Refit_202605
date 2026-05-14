using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Markets;

public class MarketDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }

    public int ProductCategoryCount { get; set; }
    public int ProfileCount { get; set; }
    public bool? IsDefaultForFree { get; set; }
}