using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.EnumTranslations;

public class CreateUpdateEnumTranslationDto
{
    [Required] public int EnumKey { get; set; }

    [Required] public string EnumValue { get; set; }

    [Required] public string EnumType { get; set; }

    [Required] public string Language { get; set; }
}