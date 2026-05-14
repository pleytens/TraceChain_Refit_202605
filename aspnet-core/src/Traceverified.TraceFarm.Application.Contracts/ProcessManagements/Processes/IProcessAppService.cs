using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProcessManagements;

public interface
    IProcessAppService : ICrudAppService<ProcessDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateProcessDto>
{
    Task<PagedResultDto<ProcessDto>> GetListCustomAsync(ProcessFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync();
}