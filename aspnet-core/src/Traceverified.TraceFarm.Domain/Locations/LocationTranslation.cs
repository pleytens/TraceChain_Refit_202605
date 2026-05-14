using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Locations;

public class LocationTranslation : FullAuditedAggregateRoot<Guid>
{
    public string LanguageCode { get; set; }
    public Guid OriginalId { get; set; }
    public string Translation { get; set; }
    public string TableName { get; set; }
}