using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Dashboards;

public interface IDashboardAppService : IApplicationService
{
    Task<ListResultDto<StatisticalDto>> GetStatisticalAsync();
    Task<StatisticalQrCodeSharedDto> PostQrCodeSharedAsync(CodeSharedFilterDto input);
    Task<StatisticalQrCodeSharedPerCusDto> PostQrCodeSharedPerCusAsync(CodeSharedPerCusFilterDto input);
    Task<IList<CompanyReportTv2Dto>> GetCompanyUsingSystem();
    Task<CompanyStatusDto> GetCompanyStatus();
    Task<IList<ProductInfoDto>> GetProducts(ProductFilterDto input);
}