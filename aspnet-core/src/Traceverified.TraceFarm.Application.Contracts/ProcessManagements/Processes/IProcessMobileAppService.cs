using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProcessManagements;

public interface IProcessMobileAppService : IApplicationService
{
    Task<PagedResultDto<ProcessMobileDto>> PostListCustomAsync(ProcessFilterDto input);
    Task<ListResultDto<ProcessDetailDto>> GetListStepInProcessAsync(Guid processId);
}