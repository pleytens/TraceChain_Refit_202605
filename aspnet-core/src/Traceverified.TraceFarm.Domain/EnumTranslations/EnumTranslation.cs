using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.EnumTranslations;

public class EnumTranslation : FullAuditedAggregateRoot<Guid>
{
    public int EnumKey { get; set; } // Enum Key in DB
    public string EnumValue { get; set; } // Enum Value display in UI
    public string EnumType { get; set; } // Enum Type Name
    public string Language { get; set; } // Language
}