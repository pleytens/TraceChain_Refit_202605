using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.ProductManagements;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.UserInteractions;

public class ReportScanTraceCodeAppService(
    IRepository<Product, Guid> productRepository,
    IRepository<DeviceView, Guid> deviceViewRepository,
    IRepository<UserInteraction, Guid> userInteractionRepository,
    IDataFilter dataFilter
    ): ApplicationService, IReportScanTraceCodeAppService
{
    public async Task<PagedResultDto<ProductScanDto>> GetProductAsync(UserInteractionFilterDto input)
    {
        // using(dataFilter.Disable<IMultiTenant>())
        // {
        var productQuery = await productRepository.GetQueryableAsync();
        var userInteractionQuery = await userInteractionRepository.GetQueryableAsync();
        var query = from userInteraction in userInteractionQuery
            join product in productQuery on userInteraction.ProductId equals product.Id
            select new ProductScanDto
            {
                ProductId = product.Id,
                Name = product.ProductName,
                GtinCode = product.GtinCode,
                NumberOfScans = userInteraction.ViewCount,
            };
        var filter = query.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), x => input.Filter != null && x.GtinCode.Contains(input.Filter));
        var grouped = filter.GroupBy(x => x.ProductId)
            .Select(g => new ProductScanDto
            {
                ProductId = g.Key,
                Name = g.First().Name,
                GtinCode = g.First().GtinCode,
                NumberOfScans = g.Sum(x => x.NumberOfScans)
            });

        var result = grouped
            .OrderBy(input.Sorting ?? "NumberOfScans")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<ProductScanDto>(grouped.Count(), result);
        // }
    }

    public async Task<PagedResultDto<GtinCodeReportDto>> GetGtinCodeReportAsync(GtinCodeReportFilterDto input)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var userInteractionQuery = await userInteractionRepository.GetQueryableAsync();
            var deviceViewQuery = await deviceViewRepository.GetQueryableAsync();
            var query = from userInteraction in userInteractionQuery
                where userInteraction.ProductId == input.ProductId
                select new GtinCodeReportDto
                {
                    TraceabilityCode = userInteraction.Url,
                    ScanDate = userInteraction.LastestInteractionTime,
                    NumberOfScans = userInteraction.ViewCount,
                    NumberOfDevices = deviceViewQuery.Count(n => n.UserInteractionId == userInteraction.Id)
                };
            var filter = query.WhereIf(
                    !string.IsNullOrWhiteSpace(input.Filter),
                    x => input.Filter != null && x.TraceabilityCode.Contains(input.Filter))
                .WhereIf(
                    input.FromDate.HasValue,
                    x => input.FromDate != null && x.ScanDate != null && x.ScanDate.Value.Date >= input.FromDate.Value.Date)
                .WhereIf(
                    input.ToDate.HasValue,
                    x => input.ToDate != null && x.ScanDate != null && x.ScanDate.Value.Date <= input.ToDate.Value.Date);
                        
            var result = query
                .OrderBy(input.Sorting ?? "NumberOfScans")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount).ToList();
            foreach (var item in result)
            {
                var splitUrl = item.TraceabilityCode.Split('/');
                item.TraceabilityCode = splitUrl[1];
            }
            return new PagedResultDto<GtinCodeReportDto>(filter.Count(), result);
        }
    }

    public async Task<List<LatLongReportDto>> GetLatLongInMapByProductId(Guid productId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var userInteractionQuery = await userInteractionRepository.GetQueryableAsync();
            var deviceViewQuery = await deviceViewRepository.GetQueryableAsync();
            var query = from userInteraction in userInteractionQuery
                join deviceView in deviceViewQuery on userInteraction.Id equals deviceView.UserInteractionId
                where userInteraction.ProductId == productId
                select new LatLongReportDto
                {
                    Latitude = deviceView.Latitude,
                    Longitude = deviceView.Longitude,
                };
            return query.ToList();
        }
    }
    public async Task<List<LatLongReportDto>> GetLatLongInMapByTraceabilityCode(string traceabilityCode)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var userInteractionQuery = await userInteractionRepository.GetQueryableAsync();
            var deviceViewQuery = await deviceViewRepository.GetQueryableAsync();
            var query = from userInteraction in userInteractionQuery
                join deviceView in deviceViewQuery on userInteraction.Id equals deviceView.UserInteractionId
                where userInteraction.Url.Contains(traceabilityCode)
                select new LatLongReportDto
                {
                    Latitude = deviceView.Latitude,
                    Longitude = deviceView.Longitude,
                };
            return query.ToList();
        }
    }
    
}