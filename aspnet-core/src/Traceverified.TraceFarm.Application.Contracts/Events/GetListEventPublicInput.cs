using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events;

public class GetListEventPublicInput : PagedAndSortedResultRequestDto
{
    public string Language { get; set; } = LanguageEnum.vi.ToString();
}