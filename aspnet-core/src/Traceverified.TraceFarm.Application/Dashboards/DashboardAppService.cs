using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Dashboards;

public class DashboardAppService(
    IRepository<RecordShare, Guid> recordShareRepository,
    IRepository<IdentityUser, Guid> userRepository,
    IRepository<Partner, Guid> partnerRepository,
    IRepository<Supplier, Guid> supplierRepository,
    IRepository<StepRecord, Guid> stepRecordRepository,
    IRepository<Product, Guid> productRepository,
    IRepository<ProductExpirationTime, Guid> productExpirationTimeRepository,
    IStorageAppService storageAppService, 
    IDataFilter dataFilter,
    IRepository<Company, Guid> companyRepository)
    : ApplicationService, IDashboardAppService
{
    public async Task<ListResultDto<StatisticalDto>> GetStatisticalAsync()
    {
        var result = new List<StatisticalDto>();
        var recordShareQuery = await recordShareRepository.GetQueryableAsync();
        var queryDoneRecordNumber = recordShareQuery.Where(n => n.SourceTenantId == CurrentTenant.Id
                                                                && n.PartnerId == null
                                                                && n.Status == (int)RecordShareStatusEnum.Done)
            .Select(n => new { n.Id, n.NumberOfStamp });
        var doneRecordNumber = queryDoneRecordNumber.Count();
        var doneRecordNumberObj = new StatisticalDto(L["Dashboard:NumberOfDoneRecord"], doneRecordNumber);
        result.Add(doneRecordNumberObj);

        var queryShareRecordNumber = recordShareQuery.Where(n =>
                n.PartnerId != null && n.SourceTenantId == CurrentTenant.Id 
                                    // && n.Status == (int)RecordShareStatusEnum.Shared
                                    )
            .Select(n => new { n.Id, n.NumberOfStamp });
        var shareRecordNumber = queryShareRecordNumber.Count();
        var shareRecordNumberObj = new StatisticalDto(L["Dashboard:NumberOfSharedRecord"], shareRecordNumber);
        result.Add(shareRecordNumberObj);

        var totalOfStamp = queryDoneRecordNumber.Union(queryShareRecordNumber).Sum(n => n.NumberOfStamp);
        var activatedRecordNumberObj = new StatisticalDto(L["Dashboard:NumberOfActivatedRecord"], totalOfStamp);
        result.Add(activatedRecordNumberObj);

        var numberOfUser = await userRepository.CountAsync();
        var numberOfUserObj = new StatisticalDto(L["Dashboard:NumberOfUser"], numberOfUser);
        result.Add(numberOfUserObj);

        var numberOfPartner = await partnerRepository.CountAsync();
        var numberOfPartnerObj = new StatisticalDto(L["Dashboard:NumberOfCustomer"], numberOfPartner);
        result.Add(numberOfPartnerObj);

        var numberOfSupplier = await supplierRepository.CountAsync();
        var numberOfSupplierObj = new StatisticalDto(L["Dashboard:NumberOfSupplier"], numberOfSupplier);
        result.Add(numberOfSupplierObj);

        return new ListResultDto<StatisticalDto>(result);
    }

    public async Task<StatisticalQrCodeSharedDto> PostQrCodeSharedAsync(CodeSharedFilterDto input)
    {
        var shareRecordQuery = await recordShareRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();

        var shareRecordData = shareRecordQuery
            .Where(n => n.SourceTenantId == CurrentTenant.Id && n.Status == (int)RecordShareStatusEnum.Done)
            .WhereIf(input.PartnerId != null, n => n.PartnerId == input.PartnerId)
            .WhereIf(input.FromDate != null, n => n.CreationTime >= input.FromDate)
            .WhereIf(input.ToDate != null, n => input.ToDate != null && n.CreationTime <= input.ToDate.Value.AddDays(1))
            .OrderBy(n => n.CreationTime)
            .GroupBy(n => n.StepRecordId)
            .Select(n => new
            {
                StepRecordCode = stepRecordQuery.FirstOrDefault(ng => ng.Id == n.Key)!.Code,
                NumberOfUnShare = n.Where(g => g.PartnerId == null).Sum(o => o.NumberOfStamp),
                NumberOfShare = n.Where(g => g.PartnerId != null).Sum(o => o.NumberOfStamp)
            }).Skip(0).Take(5).ToList();
        var labels = shareRecordData.Select(n => n.StepRecordCode).ToList();
        var result = new StatisticalQrCodeSharedDto(labels);
        var sharedData = new DatasetQrCodeSharedDto(L["Dashboard:NumberOfQRCode"],
            shareRecordData.Select(n => n.NumberOfShare).ToList(), "rgb(246, 29, 133)", "rgb(198,179,179)");
        result.Datasets.Add(sharedData);
        var unSharedData = new DatasetQrCodeSharedDto(L[" "],
            shareRecordData.Select(n => n.NumberOfUnShare).ToList(), "rgb(199, 204, 206)", "rgba(255,99,132,1)");
        result.Datasets.Add(unSharedData);
        return result;
    }

    public async Task<StatisticalQrCodeSharedPerCusDto> PostQrCodeSharedPerCusAsync(CodeSharedPerCusFilterDto input)
    {
        var shareRecordQuery = await recordShareRepository.GetQueryableAsync();
        var productQuery = await productRepository.GetQueryableAsync();

        var shareRecordData = shareRecordQuery
            .Where(n => n.SourceTenantId == CurrentTenant.Id && n.Status == (int)RecordShareStatusEnum.Done)
            .WhereIf(input.CustomerId != null,  n => n.PartnerId == input.CustomerId) // customerId add PartnerId is the same
            .WhereIf(input.ProductIds != null, n => input.ProductIds != null && input.ProductIds.Contains(n.ProductId))
            .WhereIf(input.FromDate != null, n => n.CreationTime >= input.FromDate)
            .WhereIf(input.ToDate != null, n => input.ToDate != null && n.CreationTime <= input.ToDate.Value.AddDays(1))
            .OrderBy(n => n.CreationTime)
            .GroupBy(n => n.ProductId)
            .Select(n => new
            {
                StepRecordCode = productQuery.FirstOrDefault(ng => ng.Id == n.Key)!.ProductName,
                NumberOfUnShare = n.Where(g => g.PartnerId == null).Sum(o => o.NumberOfStamp),
                NumberOfShare = n.Where(g => g.PartnerId != null).Sum(o => o.NumberOfStamp)
            }).Skip(0).Take(5).ToList();
        var labels = shareRecordData.Select(n => n.StepRecordCode).ToList();
        var result = new StatisticalQrCodeSharedPerCusDto(labels);
        var sharedData = new DatasetQrCodeSharedPerCusDto(L["Dashboard:Shared"],
            shareRecordData.Select(n => n.NumberOfShare).ToList(), "rgba(26, 225, 168, 1)", "rgba(26, 225, 168, 1)");
        result.Datasets.Add(sharedData);
        return result;
    }
    
    
    #region Dashboard tv2

    public async Task<IList<CompanyReportTv2Dto>> GetCompanyUsingSystem()
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyReportQuery = await companyRepository.GetQueryableAsync();
            var companyReportData = companyReportQuery.OrderByDescending(n=>n.CreationTime).Take(3)
                .Select(n=> new CompanyReportTv2Dto
                {
                    Name = n.Name,
                    Address = n.Address,
                    PhoneNumber = n.PhoneNumber,
                    EmailAddress = n.EmailAddress,
                    WebsiteUrl =  n.WebsiteUrl,
                    ParticipationDate = n.CreationTime,
                    Logo = n.Logo,
                }).ToList();
            foreach (var item in companyReportData)
            {
                if (item.Logo != null)
                {
                    item.LogoUrl = storageAppService.GetFileUrl(item.Logo);
                }

                var expirationDate = item.ParticipationDate.AddDays(90);
                var durationDays = (expirationDate.Date - DateTime.Now.Date).TotalDays;
                item.ExpirationDate = (int)durationDays;
            }
            return companyReportData;
        }
    }

    public async Task<CompanyStatusDto> GetCompanyStatus()
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyActivity = await companyRepository.CountAsync(n=>n.IsActive != false);
            var companyInactivity = await companyRepository.CountAsync(n=>n.IsActive == false);
            return new CompanyStatusDto
            {
                CompanyStatuses = new List<int>
                {
                    companyActivity,
                    companyInactivity
                },
                // todo: demo data
                ProfitYear = new CompanyStatusDetailDto
                {
                    Percentage = 30,
                    Profit = 1000000
                },
                ProfitMonth = new CompanyStatusDetailDto
                {
                    Percentage = 30,
                    Profit = 500000
                }
            };       
        }
    }

    public async Task<IList<ProductInfoDto>> GetProducts(ProductFilterDto input)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            input.QuantityToTake ??= 10;
            var productQuery = await productRepository.GetQueryableAsync();
            var dateTimeToCheck = DateTime.Today;
            var products = productQuery.Where(n=>n.CompanyId.HasValue)
                .WhereIf(input.FromDate != null, n => n.CreationTime >= input.FromDate)
                .WhereIf(input.ToDate != null, n => input.ToDate != null && n.CreationTime <= input.ToDate.Value)
                .WhereIf(input.IsExpired.HasValue && input.IsExpired.Value, n => n.CreationTime.AddDays(90) <= dateTimeToCheck)
                .WhereIf(input.IsExpired.HasValue && !input.IsExpired.Value, n => n.CreationTime.AddDays(90) > dateTimeToCheck)
                .OrderByDescending(n => n.CreationTime).Take(input.QuantityToTake.Value).Select(n => new ProductInfoDto
                {
                    ProductName = n.ProductName,
                    Id = n.Id,
                    CreationTime = n.CreationTime,
                    GtinCode = n.GtinCode,
                    CompanyId = n.CompanyId!.Value,
                }).ToList();
            foreach (var item in products)
            {
                var productExpirationTimeObj = await productExpirationTimeRepository.FirstOrDefaultAsync(n=>n.ProductId == item.Id);
                if (productExpirationTimeObj != null && productExpirationTimeObj.ExpirationTime.Date > DateTime.Today)
                {
                    item.IsExpired = false;
                }
                else
                {
                    item.IsExpired = item.CreationTime.AddDays(90) < DateTime.Today;
                }
                
                var companyObj = await companyRepository.FirstOrDefaultAsync(n=>n.Id == item.CompanyId);
                if (companyObj == null)
                {
                    item.CompanyName = "Company Deleted";
                    item.Email =  "Company Deleted";
                }
                else
                {
                    item.CompanyName = companyObj.Name;
                    item.Email = companyObj.EmailAddress;
                }
            }
            return products;
        }
    }
    #endregion
}