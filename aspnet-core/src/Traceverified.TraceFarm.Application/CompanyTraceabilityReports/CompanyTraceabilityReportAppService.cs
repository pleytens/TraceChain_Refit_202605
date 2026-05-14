using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.ReportTemplates;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecords.Reports;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.CompanyTraceabilityReports;

public class CompanyTraceabilityReportAppService : ApplicationService, ICompanyTraceabilityReportAppService
{
    private readonly IRepository<CompanyProfile, Guid> _companyProfileRepository;
    private readonly IRepository<Company, Guid> _companyRepository;
    private readonly IDataFilter _dataFilter;
    private readonly IRepository<LocationDistrict, Guid> _districtRepository;
    private readonly IRepository<EntityStepRecord, Guid> _entityStepRecordRepository;
    private readonly IRepository<Partner, Guid> _partnerRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<Product, Guid> _productRepository;
    private readonly IRepository<RecordReceptionV2, Guid> _recordReceptionV2Repository;
    private readonly IRepository<RecordShare, Guid> _recordShareRepository;
    private readonly IRepository<StepRecord, Guid> _stepRecordRepository;
    private readonly IStorageAppService _storageAppService;


    public CompanyTraceabilityReportAppService(IRepository<StepRecord, Guid> stepRecordRepository,
        IStorageAppService storageAppService,
        IRepository<Supplier, Guid> supplierRepository,
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<ProcessStepUser, Guid> processStepUserRepository,
        IRepository<RecordShare, Guid> recordShareRepository,
        IRepository<Product, Guid> productRepository,
        IRepository<Partner, Guid> partnerRepository,
        IRepository<CompanyProfile, Guid> companyProfileRepository,
        IDataFilter dataFilter,
        IRepository<EntityStepRecord, Guid> entityStepRecordRepository,
        IRepository<ProcessStep, Guid> processStepRepository,
        IRepository<Company, Guid> companyRepository, IRepository<RecordReceptionV2, Guid> recordReceptionV2Repository,
        IRepository<LocationDistrict, Guid> districtRepository)
    {
        _stepRecordRepository = stepRecordRepository;
        _storageAppService = storageAppService;
        _recordShareRepository = recordShareRepository;
        _productRepository = productRepository;
        _partnerRepository = partnerRepository;
        _companyProfileRepository = companyProfileRepository;
        _dataFilter = dataFilter;
        _entityStepRecordRepository = entityStepRecordRepository;
        _processStepRepository = processStepRepository;
        _companyRepository = companyRepository;
        _recordReceptionV2Repository = recordReceptionV2Repository;
        _districtRepository = districtRepository;
    }

    [Authorize(TraceFarmPermissions.Govs.Default)]
    public async Task<PagedResultDto<CompanyTraceabilityReportDto>> GetListAsync(CompanyTraceabilityReportFilter input)
    {
        using (_dataFilter.Disable<IMultiTenant>())
        {

            var recordShareQuery = await _recordShareRepository.GetQueryableAsync();
            var productQuery = await _productRepository.GetQueryableAsync();
            var partnerQuery = await _partnerRepository.GetQueryableAsync();
            var profileQuery = await _companyProfileRepository.GetQueryableAsync();
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var query = from recordShare in recordShareQuery
                join product in productQuery on recordShare.ProductId equals product.Id
                into productJoin from product in productJoin.DefaultIfEmpty()
                join partner in partnerQuery on recordShare.PartnerId equals partner.Id
                into partnerJoin from partner in partnerJoin.DefaultIfEmpty()
                join profile in profileQuery on recordShare.CompanyProfileId equals profile.Id
                into profileJoin from profile in profileJoin.DefaultIfEmpty()
                join company in companyQuery on profile.TenantId equals company.TenantId
                where recordShare.Status > (int)RecordShareStatusEnum.Recording
                select new CompanyTraceabilityReportDto
                {
                    ShareRecordId = recordShare.Id,
                    StepRecordId = recordShare.StepRecordId,
                    CompanyName = company.Name,
                    CompanyId = company.Id,
                    CreatedDate = recordShare.CreationTime,
                    TraceabilityCode = recordShare.TraceabilityCode,
                    ProductName = product.ProductName,
                    NumberOfProducts = recordShare.NumberOfStamp,
                    Customer = partner.Name,
                    SourceTenantId = recordShare.SourceTenantId,
                    EndNumber = recordShare.EndNumber,
                    LotId = recordShare.LotId
                };
            var demo = query.ToList();

            var filter = query
                .WhereIf(input.CompanyId != null, n => n.CompanyId == input.CompanyId)
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                    n => input.Filter != null && (n.TraceabilityCode.Contains(input.Filter) || 
                                                  (n.LotId != null && n.LotId.Contains(input.Filter)) ||
                                                   n.CompanyName.Contains(input.Filter)))
                .WhereIf(input.FromDate != null, n => n.CreatedDate >= input.FromDate)
                .WhereIf(input.ToDate != null, n => input.ToDate != null && n.CreatedDate
                    <= input.ToDate.Value.AddDays(1));

            var result = filter.OrderByDescending(n=>n.CreatedDate).Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .Select(n => new CompanyTraceabilityReportDto
                {
                    ShareRecordId = n.ShareRecordId,
                    StepRecordId = n.StepRecordId,
                    CompanyName = n.CompanyName,
                    CompanyId = n.CompanyId,
                    CreatedDate = n.CreatedDate,
                    TraceabilityCode = n.TraceabilityCode,
                    ProductName = n.ProductName,
                    NumberOfProducts = n.NumberOfProducts,
                    Customer = n.Customer,
                    SourceTenantId = n.SourceTenantId,
                    EndNumber = n.EndNumber,
                    LotId = n.LotId
                }).ToList();
            foreach (var item in result)
            {
                item.NumberOfNotes = 1;
                if (item.Customer != null)
                {
                    item.NumberOfNotes++;
                }
                
                var resultLst = new List<MapInfoReportV2>();
                await GetNodeOnMap(item.ShareRecordId, resultLst, 2, true);
                item.Suppliers = resultLst.Where(n => !n.IsArea).Select(n => new SupplierDto()
                {
                    Name = n.DisplayText,
                    RedirectUrl = n.RedirectUrl
                }).ToList();
                var company = companyQuery.FirstOrDefault(n => n.TenantId == item.SourceTenantId);
                if (company != null)
                {
                    item.ViewTraceabilityUrl = $"{company.GS1Code}-{item.EndNumber}&t={(int)TemplateUserTypeEnum.Government}";
                }
                
                item.NumberOfNotes += resultLst.Count(n => !n.IsArea);
            }

            return new PagedResultDto<CompanyTraceabilityReportDto>(filter.Count(), result);
        }
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetCompanyDropdownAsync()
    {
        using (_dataFilter.Disable<IMultiTenant>())
        {
            var query = (await _companyRepository.GetListAsync())
                .Where(x => !x.IsDeleted)
                .Select(x => new DropdownItemBaseDto
                {
                    Id = x.Id,
                    Name = x.Name
                }).ToList();
            return new ListResultDto<DropdownItemBaseDto>(query);
        }
    }

    private async Task<List<MapInfoReportV2>> GetNodeOnMap(Guid stepRecordId, List<MapInfoReportV2> resultLst,
        int position, bool showSupplier)
    {
        using (_dataFilter.Disable<ISoftDelete>())
        {
            var entityStepRecordQuery = await _entityStepRecordRepository.GetQueryableAsync();
            var stepRecordQuery = await _stepRecordRepository.GetQueryableAsync();
            var processStepQuery = await _processStepRepository.GetQueryableAsync();
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
            var stepRecords = (from stepRe in stepRecordQuery
                join entityStep in entityStepRecordQuery on stepRe.Id equals entityStep.StepRecordId
                join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
                where entityStep.EntityValue == stepRecordId
                select new
                {
                    StepRecordId = stepRe.Id,
                    processStep.IsSpecial
                }).GroupBy(n => n.StepRecordId).Select(n => n.FirstOrDefault()).ToList();
            foreach (var stepRecord in stepRecords)
            {
                if (stepRecord == null)
                {
                    continue;
                }

                switch (stepRecord.IsSpecial)
                {
                    case (int)StepSpecialEnum.First:
                    {
                        // get all reception by stepRecordId
                        var receptionQuery =
                            await _recordReceptionV2Repository.GetListAsync(n => n.StepRecordId == stepRecord.StepRecordId);

                        foreach (var reception in receptionQuery)
                        {
                            var mapInfoReportV2 = new MapInfoReportV2();
                            if (reception.ReceptionType == (int)EntityTypeEnum.Reception)
                            {
                                var reconShare =
                                    await _recordShareRepository.FirstOrDefaultAsync(n => n.Id == reception.RecordSharedId);
                                if (reconShare == null)
                                {
                                    continue;
                                }

                                if (showSupplier)
                                {
                                    mapInfoReportV2.MapInfoReports = new List<MapInfoReportV2>();

                                    var companyProfile =
                                        companyProfileQuery.FirstOrDefault(n => n.Id == reconShare.CompanyProfileId);
                                    if (companyProfile == null)
                                    {
                                        continue;
                                    }

                                    var company = companyQuery.FirstOrDefault(n => n.TenantId == companyProfile.TenantId);
                                    mapInfoReportV2.DisplayText = companyProfile.CompanyName;
                                    mapInfoReportV2.Latitude = company?.Latitude;
                                    mapInfoReportV2.Longitude = company?.Longitude;
                                    mapInfoReportV2.RedirectUrl = $"{company!.GS1Code}-{reconShare.StartNumber}";

                                    await GetNodeOnMap(reconShare.Id, mapInfoReportV2.MapInfoReports, position, showSupplier);
                                    resultLst.Add(mapInfoReportV2);
                                }
                                else
                                {
                                    await GetNodeOnMap(reconShare.Id, resultLst, position, showSupplier);
                                }
                            }
                        }

                        break;
                    }
                    case (int)StepSpecialEnum.Normal:
                        await GetNodeOnMap(stepRecord.StepRecordId, resultLst, position, showSupplier);
                        break;
                }
            }
        }
        return resultLst;
    }
}