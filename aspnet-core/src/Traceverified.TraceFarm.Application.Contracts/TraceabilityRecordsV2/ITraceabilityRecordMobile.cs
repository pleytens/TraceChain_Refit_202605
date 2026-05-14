using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public interface ITraceabilityRecordMobile : IApplicationService
{
    Task<PagedResultDto<ProcessRecordOutputDto>> PostProcessRecordAsync(ProcessRecordFilterDto input);
    Task<PagedResultDto<StepReportDto>> PostFirstStepReportAsync(StepReportFilterDto input);
    Task<PagedResultDto<StepReportDto>> PostNormalStepReportAsync(StepReportFilterDto input);
    Task<PagedResultDto<StepReportDto>> PostLastStepReportAsync(StepReportFilterDto input);
    Task<ListResultDto<DropdownItemForMobileDto>?> PostStepRecordDropdownAsync(StepRecordDropdownFilterDto input);
    Task<StepReportReceivedDto> GetRecordByCodeAsync(string input);
}