using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.Companies;

public class ReceptacleAppService : CrudAppService<
        Receptacle,
        ReceptacleDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReceptacleDto>,
    IReceptacleAppService
{
    private readonly IRepository<Receptacle, Guid> _repository;

    public ReceptacleAppService(IRepository<Receptacle, Guid> repository) : base(repository)
    {
        _repository = repository;
    }

    public async Task<PagedResultDto<ReceptacleDto>> GetListCustomAsync(ReceptacleFilterDto input)
    {
        var receptacleQuery = await _repository.GetQueryableAsync();
        var query = receptacleQuery.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.Code.ToLower().Contains(input.Filter.ToLower()));

        var joinQuery = from rec in query
            select new ReceptacleDto
            {
                Id = rec.Id,
                Code = rec.Code,
                Description = rec.Description,
                CreationTime = rec.CreationTime
            };
        var result = joinQuery
            .OrderBy(input.Sorting ?? "CreationTime DESC")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<ReceptacleDto>(joinQuery.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetReceptacleDropdownAsync()
    {
        var query = (await _repository.GetQueryableAsync())
            .Where(x => !x.IsDeleted)
            .OrderByDescending(n=>n.CreationTime)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Code
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }
}