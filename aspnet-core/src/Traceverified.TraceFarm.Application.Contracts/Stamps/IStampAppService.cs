using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Stamps;

public interface
    IStampAppService : ICrudAppService<StampDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateStampDto>
{
    Task<PagedResultDto<StampDto>> GetListCustomAsync(StampFilterDto filter);
    Task<StartAndEndGenerateDto> GenerateStampNumberAsync(int numberOfStamps, Guid companyId);
    Task<StampExportResponseDto> GetExcelFileAsync(Guid stampId, string clientUrl);
}