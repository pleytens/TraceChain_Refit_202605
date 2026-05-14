using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProcessManagements;

public interface IProcessStepAppService : ICrudAppService<ProcessStepDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateProcessStepDto>
{
    Task<PagedResultDto<ProcessStepDto>> GetListCustomAsync(ProcessStepFilterDto input);
    Task<bool> SetFirstStepAsync(Guid processId, Guid stepId);
    Task<bool> SetLastStepAsync(Guid processId, Guid stepId);
    Task<bool> UpdateMultipleStepAsync(List<UpdateStepPositionDto> steps);
}