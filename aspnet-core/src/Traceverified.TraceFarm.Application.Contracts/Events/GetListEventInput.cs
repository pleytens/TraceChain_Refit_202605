using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events;

public class GetListEventInput : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
}