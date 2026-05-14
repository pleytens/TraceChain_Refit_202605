using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.Markets;

public class MarketAppService : CrudAppService<
        Market, //The Market entity
        MarketDto, //Used to show markets
        Guid, //Primary key of the market entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateMarketDto>, //Used to create/update a market, 
    IMarketAppService
{
    private readonly IRepository<Market, Guid> _marketRepository;

    public MarketAppService(IRepository<Market, Guid> repository) : base(repository)
    {
        _marketRepository = repository;
        GetPolicyName = TraceFarmPermissions.Markets.Default;
        GetListPolicyName = TraceFarmPermissions.Markets.Default;
        CreatePolicyName = TraceFarmPermissions.Markets.Create;
        UpdatePolicyName = TraceFarmPermissions.Markets.Edit;
        DeletePolicyName = TraceFarmPermissions.Markets.Delete;
    }

    public async Task<PagedResultDto<MarketDto>> GetListCustomAsync(RequestCustomDto input)
    {
        var query = await _marketRepository.GetQueryableAsync();
        var filter = query.WhereIf(!string.IsNullOrEmpty(input.Filter),
            n => n.Name.ToLower().Contains(input.Filter.ToLower()));

        var result = filter.Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .Select(n => new MarketDto
            {
                Id = n.Id,
                Name = n.Name,
                ProfileCount = 0,
                ProductCategoryCount = 0
            })
            .OrderBy(input.Sorting ?? "Name")
            .ToList();

        return new PagedResultDto<MarketDto>(filter.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetMarketDropdownAsync()
    {
        var query = (await _marketRepository.GetListAsync())
            .Where(x => !x.IsDeleted)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<MarketDto> GetMarketDefaultAsync()
    {
        var query = await _marketRepository.GetQueryableAsync();
        var result = query.FirstOrDefault(n => n.IsDefaultForFree == true);
        if (result != null)
        {
            return ObjectMapper.Map<Market, MarketDto>(result);
        }

        var createMarket = new CreateUpdateMarketDto
        {
            Name = "Default Market",
            IsDefaultForFree = true
        };
        result = await _marketRepository.InsertAsync(ObjectMapper.Map<CreateUpdateMarketDto, Market>(createMarket));
        return ObjectMapper.Map<Market, MarketDto>(result);
    }
}