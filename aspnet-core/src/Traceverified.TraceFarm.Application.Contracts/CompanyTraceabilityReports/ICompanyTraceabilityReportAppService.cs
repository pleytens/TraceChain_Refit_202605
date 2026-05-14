using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.CompanyTraceabilityReports;

public interface ICompanyTraceabilityReportAppService : IApplicationService
{
    Task<PagedResultDto<CompanyTraceabilityReportDto>> GetListAsync(CompanyTraceabilityReportFilter input);
    Task<ListResultDto<DropdownItemBaseDto>> GetCompanyDropdownAsync();
}