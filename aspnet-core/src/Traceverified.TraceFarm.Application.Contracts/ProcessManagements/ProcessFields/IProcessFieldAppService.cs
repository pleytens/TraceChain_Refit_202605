using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProcessManagements;

public interface IProcessFieldAppService : ICrudAppService<ProcessFieldDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateFieldOptionDto>
{
    Task<PagedResultDto<ProcessFieldDto>> GetListCustomAsync(ProcessFieldFilterDto input);
    Task<List<CreateUpdateFieldOptionDto>> UpdateListAsync(List<CreateUpdateFieldOptionDto> inputs);
    Task<ListResultDto<EnumItemBaseDto>> GetFieldDataTypeAsync();
}