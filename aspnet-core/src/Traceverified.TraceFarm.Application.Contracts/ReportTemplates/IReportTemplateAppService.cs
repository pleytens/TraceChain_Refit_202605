using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ReportTemplates;

public interface
    IReportTemplateAppService : ICrudAppService<ReportTemplateDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateReportTemplateDto>
{
    Task<PagedResultDto<ReportTemplateDto>> GetListCustomAsync(ReportTemplateFilterDto input);
    Task<ListResultDto<EnumItemBaseDto>> GetUserTypeDropdownAsync();
    Task<ListResultDto<StepAndFieldDto>> GetStepAndField(Guid? reportTemplateId, Guid processId);
}