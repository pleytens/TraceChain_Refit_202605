using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Markets;

public interface
    IMarketAppService : ICrudAppService<MarketDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateMarketDto>
{
    Task<PagedResultDto<MarketDto>> GetListCustomAsync(RequestCustomDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetMarketDropdownAsync();
    Task<MarketDto> GetMarketDefaultAsync();
}