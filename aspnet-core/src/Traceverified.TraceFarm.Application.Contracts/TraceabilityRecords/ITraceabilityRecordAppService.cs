using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.TraceabilityRecords.Reports;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public interface ITraceabilityRecordAppService : ICrudAppService<TraceabilityRecordDto, Guid,
    PagedAndSortedResultRequestDto, CreateUpdateTraceabilityRecordDto>
{
    Task<PagedResultDto<TraceabilityRecordingDto>> GetListRecordingAsync(TraceabilityRecordFilterDto filter);
    Task<PagedResultDto<TraceabilityRecordDoneDto>> GetListDoneAsync(TraceabilityRecordFilterDto filter);
    Task<PagedResultDto<TraceabilityRecordShareDto>> GetListShareAsync(TraceabilityRecordFilterDto filter);
    Task<PagedResultDto<TraceabilityRecordReceivedDto>> GetListReceivedAsync(TraceabilityRecordFilterDto filter);

    // Step and field
    Task<ListResultDto<DropdownItemBaseDto>> GetStepDropdownAsync(Guid processId);
    Task<ListResultDto<ProcessFieldDto>> GetFieldByStepAndRecord(Guid processStepId, Guid traceabilityRecordId);
    Task<ListResultDto<RecordReceptionDto>> GetReceptionAsync(Guid processStepId, Guid traceabilityRecordId);
    Task<bool> SetDoneAsync(Guid traceabilityRecordId);

    /// <summary>
    ///     Get data for first step
    /// </summary>
    /// <param name="processStepId"></param>
    /// <param name="traceabilityRecordId"></param>
    /// <returns></returns>
    Task<ListResultDto<RecordReceptionDto>> GetRecordSharedAsync(Guid processStepId, Guid traceabilityRecordId);

    /// <summary>
    ///     Get data for last step
    /// </summary>
    /// <param name="processStepId"></param>
    /// <param name="traceabilityRecordId"></param>
    /// <returns></returns>
    Task<ListResultDto<TraceabilityRecordShareDto>> GetRecordWasSharedAsync(Guid traceabilityRecordId);

    Task<string> GenerateRecordCodeAsync();

    Task<ListResultDto<ProcessFieldResponseDto>> GetStepResponse(Guid traceRecordId,
        Guid processStepId, Guid? entityValue);

    Task<RecordReceptionDto> SaveReceptionAsync(CreateUpdateRecordReceptionDto input);
    Task<TraceabilityRecordShareDto> SaveRecordShare(CreateUpdateRecordShareDto input);
    Task<bool> SaveRecordResponseAsync(CreateUpdateRecordResponseDto input);

    Task<ListResultDto<DropdownItemBaseDto>> GetReceptionDropdownAsync(Guid processStepId, Guid traceabilityRecordId);
    Task<int> GenerateStartNumber();
    Task<bool> DeleteReceptionAsync(Guid id);

    /// <summary>
    ///     Get map information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<ListResultDto<MapInfoReport>> GetReportMapInfo(string traceCode);

    /// <summary>
    ///     Get product information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<ProductReportDto> GetReportProduct(string traceCode);

    /// <summary>
    ///     Get company information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<CompanyReportDto> GetReportCompany(string traceCode);

    /// <summary>
    ///     Get diary information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<DiaryReportDto> GetReportDiary(string traceCode);
}