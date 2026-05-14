using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Companies;

public interface IReceptacleAppService : ICrudAppService<ReceptacleDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateReceptacleDto>
{
    Task<PagedResultDto<ReceptacleDto>> GetListCustomAsync(ReceptacleFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetReceptacleDropdownAsync();
}