using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events;

public class EventFilterDto: PagedAndSortedResultRequestDto
{
    public string? FilterText { get; set; }
}