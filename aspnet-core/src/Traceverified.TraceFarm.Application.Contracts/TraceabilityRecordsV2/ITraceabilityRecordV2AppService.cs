using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public interface ITraceabilityRecordV2AppService : IApplicationService
{
    // Step and field
    Task<ListResultDto<DropdownForStepDto>> GetStepDropdownAsync(Guid processId);
    Task<ListResultDto<RecordReceptionV2Dto>> GetReceptionAsync(Guid stepRecordId);
    Task<ListResultDto<RecordShareDto>> GetRecordShareAsync(Guid stepRecordId);
    Task<CreateUpdateRecordShareDto> GetRecordShareDetailAsync(Guid recordShareId);
    Task<ListResultDto<DropdownItemBaseDto>> GetReceptionDropdownAsync(Guid processStepId, Guid? stepRecordId);
    Task<ListResultDto<ProcessFieldResponseDto>> GetStepResponse(Guid stepId, Guid? stepRecordId, Guid? entityValue);
    Task<bool> DeleteReceptionAsync(Guid id);
    Task<bool> DeleteStepRecordAsync(Guid id);
    Task<bool> DeleteRecordShareAsync(Guid id);
    Task<bool> SetStepRecordDoneAsync(Guid id);
    Task<bool> SetStepRecordingAsync(Guid id);
    Task<bool> SetStepRecordingByRecordShareAsync(Guid recordShareId);
    Task<PagedResultDto<ProcessRecordOutputDto>> GetProcessRecordAsync(ProcessRecordFilterDto input);
    Task<ListResultDto<EnumItemBaseDto>> GetStepReportStatus();
    Task<PagedResultDto<StepReportDto>> GetFirstStepReportAsync(StepReportFilterDto input);
    Task<PagedResultDto<StepReportDto>> GetNormalStepReportAsync(StepReportFilterDto input);
    Task<PagedResultDto<StepReportDto>> GetLastStepReportAsync(StepReportFilterDto input);
    Task<StartAndEndGenerateDto> GenerateStampNumberAsync(int numberOfStamps);
    Task<bool> CheckStampNumberInput(int stampNumber);
    Task<ListResultDto<DropdownItemBaseDto>?> GetStepRecordDropdownAsync(Guid stepRecordId, List<Guid?>? entityIds);
    Task<ListResultDto<DropdownItemForMobileDto>?> GetStepRecordDropdownMobileAsync(Guid processStepId,
        List<Guid?>? entityIds);
    Task<Guid> SaveRecordResponseAsync(CreateUpdateStepReportFirstDto input);
    Task<List<Guid>> SaveListRecordResponseAsync(List<CreateUpdateStepReportFirstDto> input);
    Task<Guid> SaveRecordResponseNormalAsync(CreateUpdateStepReportNormalDto input);
    Task<List<Guid>> SaveListRecordResponseNormalAsync(List<CreateUpdateStepReportNormalDto> input);
    Task<Guid> SaveRecordResponseLastAsync(CreateUpdateStepReportLastDto input);
    Task<List<Guid>> SaveListRecordResponseLastAsync(List<CreateUpdateStepReportLastDto> input);
    Task<PagedResultDto<StepReportDoneDto>> GetStepRecordDoneAsync(StepReportDoneFilterDto input);
    Task<PagedResultDto<StepReportReceivedDto>> GetStepRecordReceivedAsync(StepReportShareFilterDto input);
    Task<PagedResultDto<StepReportReceivedDto>> GetStepRecordSharedAsync(StepReportShareFilterDto input);
    Task<RecordExportResponseDto> GetExcelFileAsync(Guid stampId, string clientUrl);

    Task<ListResultDto<DropdownItemForMobileDto>> GetReceptionDropdownForMobileAsync(Guid processStepId, Guid? stepRecordId);
}