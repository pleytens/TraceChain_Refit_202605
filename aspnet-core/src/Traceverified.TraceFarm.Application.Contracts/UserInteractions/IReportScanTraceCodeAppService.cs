using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.UserInteractions;

public interface IReportScanTraceCodeAppService: IApplicationService
{
    Task<PagedResultDto<ProductScanDto>> GetProductAsync(UserInteractionFilterDto filter);
    Task<PagedResultDto<GtinCodeReportDto>> GetGtinCodeReportAsync(GtinCodeReportFilterDto filter);
    Task<List<LatLongReportDto>> GetLatLongInMapByTraceabilityCode(string traceabilityCode);
    Task<List<LatLongReportDto>> GetLatLongInMapByProductId(Guid productId);
}