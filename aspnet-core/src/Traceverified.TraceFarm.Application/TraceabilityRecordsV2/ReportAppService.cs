using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.ReportTemplates;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecords.Reports;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class ReportAppService(
    IRepository<Supplier, Guid> supplierRepository,
    IRepository<Receptacle, Guid> receptacleRepository,
    IRepository<Partner, Guid> partnerRepository,
    IRepository<Company, Guid> companyRepository,
    IDataFilter dataFilter,
    IRepository<LocationDistrict, Guid> districtRepository,
    IRepository<ImageStorage, Guid> imageStorageRepository,
    IRepository<ProcessFieldOption, Guid> processFieldOptionRepository,
    IRepository<ProcessField, Guid> processFieldRepository,
    IRepository<ProcessStep, Guid> processStepRepository,
    IRepository<Product, Guid> productRepository,
    IRepository<RecordReceptionV2, Guid> recordReceptionV2Repository,
    IStorageAppService storageAppService,
    IRepository<StepRecord, Guid> stepRecordRepository,
    IRepository<EntityStepRecord, Guid> entityStepRecordRepository,
    IRepository<RecordShare, Guid> recordShareRepository,
    IRepository<FieldRecord, Guid> fieldRecordRepository,
    IRepository<CompanyProfile, Guid> companyProfileRepository,
    IRepository<LocationCountry, Guid> countryRepository,
    IRepository<ReportTemplate, Guid> reportTemplateRepository,
    IRepository<ProcessFieldTemplate, Guid> processFieldTemplateRepository)
    : ApplicationService, IReportAppService
{
    // v2
    public async Task<ListResultDto<MapInfoReportV2>> GetReportMapInfo(string traceCode, int userType = 10)
    {
        var result = new List<MapInfoReportV2>();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }
            var reportTemplate =
                await reportTemplateRepository.FirstOrDefaultAsync(n =>
                    n.UserType == userType && n.TenantId == company.TenantId) ?? new ReportTemplate
                {
                    AllowShowFrontNode = true,
                    AllowShowFullInfo = true,
                    AllowShowFollowNode = true,
                    AllowShowLink = true
                };
            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            if (recordShare.PartnerId.HasValue)
            {
                var partner = await partnerRepository.FirstOrDefaultAsync(n => n.Id == recordShare.PartnerId);
                if (partner == null)
                {
                    throw new UserFriendlyException(L["TraceCode:Error:PartnerInvalid"]);
                }
                
                if (reportTemplate.AllowShowFollowNode == true)
                {
                    var companyInfo = companyQuery.FirstOrDefault(n => n.Id == partner.CompanyId);
                    var companyProfileId = Guid.Empty;
                    if (companyInfo != null)
                    {
                        var companyProfilePn = companyProfileQuery.Select(n => new 
                        {
                            n.Id,
                            n.TenantId
                        }).FirstOrDefault(n => n.TenantId == companyInfo.TenantId);
                        companyProfileId = companyProfilePn?.Id ?? Guid.Empty;
                    }
                    result.Add(new MapInfoReportV2
                    {
                        Latitude = partner.Latitude,
                        Longitude = partner.Longitude,
                        DisplayText = partner.Name,
                        CompanyProfileId = companyInfo != null ? companyProfileId: partner.Id,
                        IsGetCompanyInfo = companyInfo != null,
                        Position = 0
                    });
                }
            }
            var companyProfile = companyProfileQuery.Select(n=> new
            {
                n.Id,
                n.CompanyName,
            }).FirstOrDefault(n => n.Id == recordShare.CompanyProfileId);
            
            var mapInfo = new MapInfoReportV2
            {
                DisplayText = companyProfile != null ? companyProfile.CompanyName: company.Name,
                Latitude = company.Latitude,
                Longitude = company.Longitude,
                CompanyProfileId = companyProfile?.Id ?? company.Id,
                ProductId = recordShare.ProductId,
                CreatedTime = recordShare.CreationTime,
                TraceabilityCode = traceCode,
                Position = 1
            };
            if (reportTemplate.AllowShowFrontNode == true)
            {
                var resultLst = new List<MapInfoReportV2>();
                mapInfo.MapInfoReports = await GetNodeOnMap(recordShare.Id, resultLst, 2,
                    reportTemplate.AllowShowFullInfo ?? true);
            }

            result.Add(mapInfo);
        }

        return new ListResultDto<MapInfoReportV2>(result);
    }
    
    public async Task<ListResultDto<CompanyCardInfoDto>> GetReportCompanyInfo(string traceCode, int userType = 10)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var mapItems = await GetReportMapInfo(traceCode, userType);
            var flattenedItems = FlattenItems(mapItems);

            if (flattenedItems.Count == 0)
            {
                return new ListResultDto<CompanyCardInfoDto>(new List<CompanyCardInfoDto>());
            }

            var partnerIds = flattenedItems
                .Where(item => item is { Position: 0, IsGetCompanyInfo: false } && item.CompanyProfileId != Guid.Empty)
                .Select(item => item.CompanyProfileId)
                .Distinct()
                .ToList();

            var companyProfileIds = flattenedItems
                .Where(item => item.CompanyProfileId != Guid.Empty && (item.Position != 0 || item.IsGetCompanyInfo))
                .Select(item => item.CompanyProfileId)
                .Distinct()
                .ToList();

            var productIds = flattenedItems
                .Where(item => item.ProductId != Guid.Empty)
                .Select(item => item.ProductId)
                .Distinct()
                .ToList();

            var partnerAddressDict = new Dictionary<Guid, string>();
            if (partnerIds.Count > 0)
            {
                var partnerQuery = await partnerRepository.GetQueryableAsync();
                partnerAddressDict = await partnerQuery
                    .Where(partner => partnerIds.Contains(partner.Id))
                    .Select(partner => new { partner.Id, partner.Address })
                    .ToDictionaryAsync(partner => partner.Id, partner => partner.Address);
            }

            var companyProfileDict = new Dictionary<Guid, (Guid? TenantId, string CompanyName)>();
            if (companyProfileIds.Count > 0)
            {
                var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
                var companyProfiles = await companyProfileQuery
                    .Where(profile => companyProfileIds.Contains(profile.Id))
                    .Select(profile => new { profile.Id, profile.CompanyName, profile.TenantId })
                    .ToListAsync();
                companyProfileDict = companyProfiles
                    .ToDictionary(profile => profile.Id, profile => (profile.TenantId, profile.CompanyName));
            }

            var tenantIds = companyProfileDict.Values
                .Select(profile => profile.TenantId)
                .Where(tenantId => tenantId.HasValue)
                .Select(tenantId => tenantId!.Value)
                .Distinct()
                .ToList();

            var companyDict = new Dictionary<Guid, (string? Address, string? Logo)>();
            if (tenantIds.Count > 0)
            {
                var companyQuery = await companyRepository.GetQueryableAsync();
                companyDict = await companyQuery
                    .Where(company => tenantIds.Contains(company.TenantId))
                    .Select(company => new { company.TenantId, company.Address, company.Logo })
                    .ToDictionaryAsync(company => company.TenantId, company => (company.Address, company.Logo));
            }

            var productDict = new Dictionary<Guid, string>();
            if (productIds.Count > 0)
            {
                var productQuery = await productRepository.GetQueryableAsync();
                productDict = await productQuery
                    .Where(product => productIds.Contains(product.Id))
                    .Select(product => new { product.Id, product.ProductName })
                    .ToDictionaryAsync(product => product.Id, product => product.ProductName);
            }

            var logoUrlCache = new Dictionary<string, string>();
            var result = new List<CompanyCardInfoDto>(flattenedItems.Count);

            foreach (var item in flattenedItems)
            {
                var companyCard = new CompanyCardInfoDto
                {
                    CompanyProfileId = item.CompanyProfileId,
                    CompanyName = item.DisplayText,
                    TraceabilityCode = item.TraceabilityCode,
                    CreatedTime = item.CreatedTime
                };

                if (item is { Position: 0, IsGetCompanyInfo: false })
                {
                    if (item.CompanyProfileId != Guid.Empty &&
                        partnerAddressDict.TryGetValue(item.CompanyProfileId, out var partnerAddress))
                    {
                        companyCard.Address = partnerAddress;
                    }
                }
                else
                {
                    if (item.CompanyProfileId == Guid.Empty ||
                        !companyProfileDict.TryGetValue(item.CompanyProfileId, out var profileInfo) ||
                        profileInfo.TenantId == null ||
                        !companyDict.TryGetValue(profileInfo.TenantId.Value, out var companyInfo))
                    {
                        continue;
                    }

                    companyCard.Address = companyInfo.Address;

                    if (!string.IsNullOrEmpty(companyInfo.Logo))
                    {
                        if (!logoUrlCache.TryGetValue(companyInfo.Logo, out var logoUrl))
                        {
                            logoUrl = storageAppService.GetFileUrl(companyInfo.Logo);
                            logoUrlCache[companyInfo.Logo] = logoUrl;
                        }

                        companyCard.CompanyLogoUrl = logoUrl;
                    }
                }

                if (item.ProductId != Guid.Empty &&
                    productDict.TryGetValue(item.ProductId, out var productName))
                {
                    companyCard.ProductName = productName;
                }

                result.Add(companyCard);
            }

            return new ListResultDto<CompanyCardInfoDto>(result);
        }
    }

    private static List<MapInfoReportV2> FlattenItems(ListResultDto<MapInfoReportV2> items)
    {
        var result = new List<MapInfoReportV2>();
        foreach (var item in items.Items)
        {
            if (item.IsArea)
            {
                continue;
            }

            result.Add(item);

            if (item.MapInfoReports == null || !item.MapInfoReports.Any())
            {
                continue;
            }

            result.AddRange(FlattenItems(new ListResultDto<MapInfoReportV2>(item.MapInfoReports)));
        }

        return result;
    }

    public async Task<ProductReportDto> GetReportProduct(string traceCode)
    {
        var result = new ProductReportDto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var product = await productRepository.GetAsync(recordShare.ProductId);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }

            result.ProductName = product.ProductName;
            result.GtinCode = product.GtinCode;
            result.Description = product.Description;
            result.ProductId = product.Id;
            result.ActivationDate = recordShare.CreationTime.ToString("dd/MM/yyyy");
            if (company.Logo != null)
            {
                result.CompanyLogo = storageAppService.GetFileUrl(company.Logo);
            }

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();

            var productImages = imageStorageQuery.Where(n => n.RelatedEntityId == product.Id
                                                             && n.RelatedEntityType >= (int)ImageStorageEnum.Product
                                                                && n.RelatedEntityType <=
                                                                 (int)ImageStorageEnum.ProductFile)
                .Select(n => n).OrderBy(n=>n.ImageNameRaw).ToList();
            result.DocumentFiles = [];
            foreach (var image in productImages)
            {
                switch (image.RelatedEntityType)
                {
                    case (int)ImageStorageEnum.Product:
                        result.Images.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                    case (int)ImageStorageEnum.ProductYoutubeUrl:
                        result.VideoUrls.Add(image.ImageName);
                        break;
                    case (int)ImageStorageEnum.ProductFile:
                        result.DocumentFiles.Add(new ProductDocumentFileDto()
                        {
                            Id =  image.Id,
                            Name = image.ImageNameRaw??image.ImageName,
                            Url = storageAppService.GetFileUrl(image.ImageName)
                        });
                        break;
                    default:
                        result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                }
            }
        }

        return result;
    }

    public async Task<ProductReportForExportDto> GetReportProductForExport(string traceCode)
    {
        var result = new ProductReportForExportDto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var product = await productRepository.GetAsync(recordShare.ProductId);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }

            result.ProductName = product.ProductName;
            result.GtinCode = product.GtinCode;
            result.Description = product.Description;
            result.ActivationDate = recordShare.CreationTime.ToString("dd/MM/yyyy");
            result.QuantityItems = recordShare.NumberOfStamp;
            if (company.Logo != null)
            {
                result.CompanyLogo = storageAppService.GetFileUrl(company.Logo);
            }

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();

            var productImages = imageStorageQuery.Where(n => n.RelatedEntityId == product.Id
                                                             && n.RelatedEntityType >= (int)ImageStorageEnum.Product
                                                             && n.RelatedEntityType <=
                                                             (int)ImageStorageEnum.ProductFile)
                .Select(n => n).OrderBy(n=>n.CreationTime).ToList();
            result.DocumentFiles = [];
            foreach (var image in productImages)
            {
                switch (image.RelatedEntityType)
                {
                    case (int)ImageStorageEnum.Product:
                        result.Images.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                    case (int)ImageStorageEnum.ProductYoutubeUrl:
                        result.VideoUrls.Add(image.ImageName);
                        break;
                    case (int)ImageStorageEnum.ProductFile:
                        result.DocumentFiles.Add(new ProductDocumentFileDto()
                        {
                            Id =  image.Id,
                            Name = image.ImageNameRaw??image.ImageName,
                            Url = storageAppService.GetFileUrl(image.ImageName)
                        });
                        break;
                    default:
                        result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                }
            }
        }
        return result;
    }
    public async Task<CompanyReportDto> GetReportCompany(string traceCode)
    {
        var result = new CompanyReportDto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);

            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var companyProfile = companyProfileQuery.FirstOrDefault(n => n.Id == recordShare.CompanyProfileId);
            if (companyProfile == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyProfileInvalid"]);
            }

            result.Name = companyProfile.CompanyName;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            result.Description = companyProfile.Description;
            result.GS1Code = company.GS1Code;
            result.TenantId = company.TenantId;
            var country = await countryRepository.FirstOrDefaultAsync(n => n.Id == company.NationId);
            result.Country = country != null ? string.IsNullOrEmpty(country.Alias)?country.OriginalName : country.Alias : "";

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();
            var companyProfileImages = imageStorageQuery.Where(n => n.RelatedEntityId == recordShare.CompanyProfileId
                                                                    && n.RelatedEntityType >=
                                                                    (int)ImageStorageEnum.CompanyProfileCertification)
                .Select(n => n).ToList();
            foreach (var image in companyProfileImages)
            {
                result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
            }
        }

        return result;
    }

    public async Task<DiaryReportV2Dto> GetReportDiary(string traceCode, int userType = 10)
    {
        var result = new DiaryReportV2Dto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
            var processStepQuery = await processStepRepository.GetQueryableAsync();
            var processFieldQuery = await processFieldRepository.GetQueryableAsync();
            var fieldRecordQuery = await fieldRecordRepository.GetQueryableAsync();
            var processTemplateFieldQuery = await processFieldTemplateRepository.GetQueryableAsync();
            var supplierNameCache = new Dictionary<Guid, string>();
            var receptacleCodeCache = new Dictionary<Guid, string>();
            var partnerNameCache = new Dictionary<Guid, string>();
            var productNameCache = new Dictionary<Guid, string>();
            var optionValueCache = new Dictionary<Guid, string>();

            async Task<string?> GetSupplierNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!supplierNameCache.TryGetValue(id, out var cachedValue))
                {
                    var supplier = await supplierRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = supplier?.Name ?? string.Empty;
                    supplierNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetReceptacleCodeAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!receptacleCodeCache.TryGetValue(id, out var cachedValue))
                {
                    var receptacle = await receptacleRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = receptacle?.Code ?? string.Empty;
                    receptacleCodeCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetPartnerNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!partnerNameCache.TryGetValue(id, out var cachedValue))
                {
                    var partner = await partnerRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = partner?.Name ?? string.Empty;
                    partnerNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetProductNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!productNameCache.TryGetValue(id, out var cachedValue))
                {
                    var product = await productRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = product?.ProductName ?? string.Empty;
                    productNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetFieldOptionValueAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!optionValueCache.TryGetValue(id, out var cachedValue))
                {
                    var option = await processFieldOptionRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = option?.OptionValue ?? string.Empty;
                    optionValueCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }
            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var recordShare = recordShareQuery.FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                                                   && n.EndNumber >= traceabilityCode
                                                                   && company.TenantId == n.SourceTenantId);
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var reportTemplate =
                await reportTemplateRepository.FirstOrDefaultAsync(n =>
                    n.UserType == userType && n.TenantId == company.TenantId) ?? new ReportTemplate
                {
                    AllowShowFrontNode = true,
                    AllowShowFullInfo = true,
                    AllowShowFollowNode = true,
                    AllowShowLink = true
                };
            var diaryNodes = new List<DiaryNode>();
            // this is las step record
            // This is point to start get previous step record
            var lastStepRecord = (from stepRe in stepRecordQuery
                join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
                where stepRe.Id == recordShare.StepRecordId
                select new DiaryNode
                {
                    StepRecordId = stepRe.Id,
                    IsSpecial = processStep.IsSpecial,
                    StepName = processStep.Name,
                    StepRecordCode = stepRe.Code,
                    ProcessStepId = processStep.Id,
                    EntityId = recordShare.Id,
                    CreatedTime = stepRe.CreationTime,
                    LotId = recordShare.LotId,
                }).FirstOrDefault();
            if (lastStepRecord != null)
            {
                diaryNodes.Add(lastStepRecord);
            }

            await GetNodeDairyReport(recordShare.Id, diaryNodes);
            foreach (var diaryNode in diaryNodes.GroupBy(n => n.ProcessStepId).ToList())
            {
                if (diaryNode.FirstOrDefault() == null)
                {
                    continue;
                }
                
                var diaryReportStepV2Dto = new DiaryReportStepV2Dto
                {
                    LotId =  diaryNode.FirstOrDefault()!.LotId,
                    StepName = diaryNode.FirstOrDefault()!.StepName,
                    StepType =  diaryNode.FirstOrDefault()!.IsSpecial,
                    CreatedTime = diaryNode.FirstOrDefault()!.CreatedTime,
                    StepRecords = new List<DiaryStepRecordDto>()
                };
                var showLink = reportTemplate.AllowShowLink ?? false;
                foreach (var node in diaryNode)
                {
                    var fieldRecordData = (from fieldRecord in fieldRecordQuery
                        join templateFile in processTemplateFieldQuery on fieldRecord.ProcessFieldId equals templateFile
                                .ProcessFieldId
                            into temp
                        from templateFile in temp.DefaultIfEmpty()
                        join field in processFieldQuery on fieldRecord.ProcessFieldId equals field.Id
                        where fieldRecord.StepRecordId == node.StepRecordId
                              && fieldRecord.Selected == true
                              && templateFile.ReportTemplateId == reportTemplate.Id
                              && fieldRecord.EntityId == node.EntityId
                        select new
                        {
                            FieldName = field.Name,
                            fieldRecord.ResponseText,
                            field.DataType,
                            FieldOptionId = fieldRecord.ProcessFieldOptionId,
                            fieldRecord.ProcessFieldId,
                            fieldRecord.EntityId,
                            fieldRecord.EntityType,
                            field.Position,
                        }).GroupBy(n => new
                    {
                        n.EntityType,
                        n.EntityId
                    }).ToList();
                    var fieldRecords = new List<DiaryFieldRecordReportDto>();
                    var diaryStepRecordDto = new DiaryStepRecordDto
                    {
                        StepRecordCode = node.StepRecordCode,
                        ReceptionOrOriginFieldName = node.ReceptionOrOriginFieldName,
                        ReceptionOrOriginData = node.ReceptionOrOriginData,
                        FieldRecords = fieldRecords,
                        RedirectUrl = showLink && node.ReceptionOrOriginFieldName == nameof(EntityTypeEnum.Reception)
                            ? node.RedirectUrl
                            : "#"
                    };
                    foreach (var entityGroup in fieldRecordData)
                    {
                        fieldRecords = new List<DiaryFieldRecordReportDto>();
                        var fieldGroup = entityGroup.GroupBy(n => n.ProcessFieldId).ToList();
                        foreach (var field in fieldGroup)
                        {
                            var fieldObj = field.FirstOrDefault();
                            if (fieldObj == null)
                            {
                                continue;
                            }

                            var fieldReport = new DiaryFieldRecordReportDto
                            {
                                FieldName = fieldObj.FieldName,
                                DataType = fieldObj.DataType,
                                ResponseText = field.FirstOrDefault()?.ResponseText,
                                Position = fieldObj.Position
                            };
                            if (fieldObj.DataType <= (int)ProcessDataTypeEnum.MultiDropdown)
                            {
                                var optionTexts = new List<string>();
                                foreach (var optionId in field.Select(g => g.FieldOptionId)
                                             .Where(optionId => optionId != Guid.Empty)
                                             .Distinct())
                                {
                                    var optionValue = await GetFieldOptionValueAsync(optionId);
                                    if (!string.IsNullOrEmpty(optionValue))
                                    {
                                        optionTexts.Add(optionValue);
                                    }
                                }

                                fieldReport.ResponseText = optionTexts.JoinAsString(",");
                            }

                            switch (fieldObj.DataType)
                            {
                                case (int)ProcessDataTypeEnum.Supplier:
                                {
                                    var value = await GetSupplierNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Receptacle:
                                {
                                    var value = await GetReceptacleCodeAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Partner:
                                {
                                    var value = await GetPartnerNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Product:
                                {
                                    var value = await GetProductNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                            }

                            fieldRecords.Add(fieldReport);
                        }

                        diaryStepRecordDto.FieldRecords = fieldRecords.OrderBy(n=>n.Position).ToList();
                    }

                    diaryReportStepV2Dto.StepRecords.Add(diaryStepRecordDto);
                }

                result.Steps.Add(diaryReportStepV2Dto);
            }
        }

        return result;
    }

    public async Task<DiaryReportV2Dto> GetReportDiaryByTraceabilityCode(string traceCode, int userType = 10)
    {
        if (traceCode.Contains('-'))
        {
            return await GetReportDiary(traceCode, userType);
        }
        var result = new DiaryReportV2Dto();
        
        // Lấy 6 ký tự cuối
        var last6 = traceCode.Length > 6 
            ? traceCode.Substring(traceCode.Length - 6) 
            : traceCode;

        // Lấy phần đầu (trừ 6 ký tự cuối)
        var gS1Code = traceCode.Length > 6 
            ? traceCode.Substring(0, traceCode.Length - 6) 
            : string.Empty;
        if (string.IsNullOrEmpty(last6) || string.IsNullOrEmpty(gS1Code))
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
            var processStepQuery = await processStepRepository.GetQueryableAsync();
            var processFieldQuery = await processFieldRepository.GetQueryableAsync();
            var fieldRecordQuery = await fieldRecordRepository.GetQueryableAsync();
            var processTemplateFieldQuery = await processFieldTemplateRepository.GetQueryableAsync();
            var supplierNameCache = new Dictionary<Guid, string>();
            var receptacleCodeCache = new Dictionary<Guid, string>();
            var partnerNameCache = new Dictionary<Guid, string>();
            var productNameCache = new Dictionary<Guid, string>();
            var optionValueCache = new Dictionary<Guid, string>();

            async Task<string?> GetSupplierNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!supplierNameCache.TryGetValue(id, out var cachedValue))
                {
                    var supplier = await supplierRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = supplier?.Name ?? string.Empty;
                    supplierNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetReceptacleCodeAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!receptacleCodeCache.TryGetValue(id, out var cachedValue))
                {
                    var receptacle = await receptacleRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = receptacle?.Code ?? string.Empty;
                    receptacleCodeCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetPartnerNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!partnerNameCache.TryGetValue(id, out var cachedValue))
                {
                    var partner = await partnerRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = partner?.Name ?? string.Empty;
                    partnerNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetProductNameAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!productNameCache.TryGetValue(id, out var cachedValue))
                {
                    var product = await productRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = product?.ProductName ?? string.Empty;
                    productNameCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }

            async Task<string?> GetFieldOptionValueAsync(Guid id)
            {
                if (id == Guid.Empty)
                {
                    return null;
                }

                if (!optionValueCache.TryGetValue(id, out var cachedValue))
                {
                    var option = await processFieldOptionRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                    cachedValue = option?.OptionValue ?? string.Empty;
                    optionValueCache[id] = cachedValue;
                }

                return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
            }
            var company = companyQuery.FirstOrDefault(n => n.GS1Code == gS1Code);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(last6);
            var recordShare = recordShareQuery.FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                                                   && n.EndNumber >= traceabilityCode
                                                                   && company.TenantId == n.SourceTenantId);
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var reportTemplate =
                await reportTemplateRepository.FirstOrDefaultAsync(n =>
                    n.UserType == userType && n.TenantId == company.TenantId) ?? new ReportTemplate
                {
                    AllowShowFrontNode = true,
                    AllowShowFullInfo = true,
                    AllowShowFollowNode = true,
                    AllowShowLink = true
                };
            var diaryNodes = new List<DiaryNode>();
            // this is las step record
            // This is point to start get previous step record
            var lastStepRecord = (from stepRe in stepRecordQuery
                join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
                where stepRe.Id == recordShare.StepRecordId
                select new DiaryNode
                {
                    StepRecordId = stepRe.Id,
                    IsSpecial = processStep.IsSpecial,
                    StepName = processStep.Name,
                    StepRecordCode = stepRe.Code,
                    ProcessStepId = processStep.Id,
                    EntityId = recordShare.Id,
                    CreatedTime = stepRe.CreationTime,
                }).FirstOrDefault();
            if (lastStepRecord != null)
            {
                diaryNodes.Add(lastStepRecord);
            }

            await GetNodeDairyReport(recordShare.Id, diaryNodes);
            foreach (var diaryNode in diaryNodes.GroupBy(n => n.ProcessStepId).ToList())
            {
                if (diaryNode.FirstOrDefault() == null)
                {
                    continue;
                }
                
                var diaryReportStepV2Dto = new DiaryReportStepV2Dto
                {
                    StepName = diaryNode.FirstOrDefault()!.StepName,
                    StepType =  diaryNode.FirstOrDefault()!.IsSpecial,
                    CreatedTime = diaryNode.FirstOrDefault()!.CreatedTime,
                    StepRecords = new List<DiaryStepRecordDto>()
                };
                var showLink = reportTemplate.AllowShowLink ?? false;
                foreach (var node in diaryNode)
                {
                    var fieldRecordData = (from fieldRecord in fieldRecordQuery
                        join templateFile in processTemplateFieldQuery on fieldRecord.ProcessFieldId equals templateFile
                                .ProcessFieldId
                            into temp
                        from templateFile in temp.DefaultIfEmpty()
                        join field in processFieldQuery on fieldRecord.ProcessFieldId equals field.Id
                        where fieldRecord.StepRecordId == node.StepRecordId
                              && fieldRecord.Selected == true
                              && templateFile.ReportTemplateId == reportTemplate.Id
                              && fieldRecord.EntityId == node.EntityId
                        select new
                        {
                            FieldName = field.Name,
                            fieldRecord.ResponseText,
                            field.DataType,
                            FieldOptionId = fieldRecord.ProcessFieldOptionId,
                            fieldRecord.ProcessFieldId,
                            fieldRecord.EntityId,
                            fieldRecord.EntityType,
                            field.Position,
                        }).GroupBy(n => new
                    {
                        n.EntityType,
                        n.EntityId
                    }).ToList();
                    var fieldRecords = new List<DiaryFieldRecordReportDto>();
                    var diaryStepRecordDto = new DiaryStepRecordDto
                    {
                        StepRecordCode = node.StepRecordCode,
                        ReceptionOrOriginFieldName = node.ReceptionOrOriginFieldName,
                        ReceptionOrOriginData = node.ReceptionOrOriginData,
                        FieldRecords = fieldRecords,
                        RedirectUrl = showLink && node.ReceptionOrOriginFieldName == nameof(EntityTypeEnum.Reception)
                            ? node.RedirectUrl
                            : "#"
                    };
                    foreach (var entityGroup in fieldRecordData)
                    {
                        fieldRecords = new List<DiaryFieldRecordReportDto>();
                        var fieldGroup = entityGroup.GroupBy(n => n.ProcessFieldId).ToList();
                        foreach (var field in fieldGroup)
                        {
                            var fieldObj = field.FirstOrDefault();
                            if (fieldObj == null)
                            {
                                continue;
                            }

                            var fieldReport = new DiaryFieldRecordReportDto
                            {
                                FieldName = fieldObj.FieldName,
                                DataType = fieldObj.DataType,
                                ResponseText = field.FirstOrDefault()?.ResponseText,
                                Position = fieldObj.Position
                            };
                            if (fieldObj.DataType <= (int)ProcessDataTypeEnum.MultiDropdown)
                            {
                                var optionTexts = new List<string>();
                                foreach (var optionId in field.Select(g => g.FieldOptionId)
                                             .Where(optionId => optionId != Guid.Empty)
                                             .Distinct())
                                {
                                    var optionValue = await GetFieldOptionValueAsync(optionId);
                                    if (!string.IsNullOrEmpty(optionValue))
                                    {
                                        optionTexts.Add(optionValue);
                                    }
                                }

                                fieldReport.ResponseText = optionTexts.JoinAsString(",");
                            }

                            switch (fieldObj.DataType)
                            {
                                case (int)ProcessDataTypeEnum.Supplier:
                                {
                                    var value = await GetSupplierNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Receptacle:
                                {
                                    var value = await GetReceptacleCodeAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Partner:
                                {
                                    var value = await GetPartnerNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Product:
                                {
                                    var value = await GetProductNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                            }

                            fieldRecords.Add(fieldReport);
                        }

                        diaryStepRecordDto.FieldRecords = fieldRecords.OrderBy(n=>n.Position).ToList();
                    }

                    diaryReportStepV2Dto.StepRecords.Add(diaryStepRecordDto);
                }

                result.Steps.Add(diaryReportStepV2Dto);
            }
        }

        return result;
    }
    public async Task<bool> ShowUserType(string traceCode)
    {
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        var companyQuery = await companyRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var recordShareQuery = await recordShareRepository.GetQueryableAsync();

        var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
        if (company == null)
        {
            throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
        }

        var traceabilityCode = int.Parse(traceCodeSplit[1]);
        var recordShare = recordShareQuery
            .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                 && n.EndNumber >= traceabilityCode
                                 && company.TenantId == n.SourceTenantId
            );
        if (recordShare == null)
        {
            throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
        }

        var stepRecordObj = stepRecordQuery.FirstOrDefault(n => n.Id == recordShare.StepRecordId);
        return stepRecordObj != null;
    }

    private async Task<List<MapInfoReportV2>> GetNodeOnMap(Guid stepRecordId, List<MapInfoReportV2> resultLst,
        int position, bool showSupplier)
    {
        var entityStepRecordQuery = await entityStepRecordRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var processStepQuery = await processStepRepository.GetQueryableAsync();
        var companyQuery = await companyRepository.GetQueryableAsync();
        var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
        var recordReceptionV2Query = await recordReceptionV2Repository.GetQueryableAsync();
        var districtQuery = await districtRepository.GetQueryableAsync();
        var stepRecords = (from entityStep in entityStepRecordQuery
            join stepRe in stepRecordQuery on entityStep.StepRecordId equals stepRe.Id
            join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
            where entityStep.EntityValue == stepRecordId &&
                  processStep.IsSpecial <= (int)StepSpecialEnum.Normal
            select new
            {
                StepRecordId = stepRe.Id,
                processStep.IsSpecial
            }).Distinct().ToList();
        foreach (var stepRecord in stepRecords)
        {
            switch (stepRecord.IsSpecial)
            {
                case (int)StepSpecialEnum.First:
                {
                    // get all reception by stepRecordId
                    var receptionQuery = recordReceptionV2Query.Where(n => n.StepRecordId == stepRecord.StepRecordId
                                                                           && n.ReceptionType <= (int)EntityTypeEnum.Origin).Select(n=> new
                                                                        {
                                                                            n.ReceptionType,
                                                                            n.RecordSharedId,
                                                                            n.DistrictId,
                                                                        }).ToList();
                    var originLst = receptionQuery.Where(n=> n.ReceptionType == (int)EntityTypeEnum.Origin)
                        .Select(n=>n.DistrictId).ToList();
                    if (originLst.Count > 0)
                    {
                        var districts = (from district in districtQuery
                            where originLst.Contains(district.Id)
                            select new MapInfoReportV2
                            {
                                IsArea = true,
                                Position = position,
                                DisplayText = district.OriginalName,
                                Latitude = district.Latitude,
                                Longitude = district.Longitude,
                            }).ToList();
                        resultLst.AddRange(districts);
                        
                        if (originLst.Count == receptionQuery.Count)
                        {
                            return resultLst;
                        }
                    }
                    var receptionLst = receptionQuery.Where(n => 
                        n.ReceptionType == (int)EntityTypeEnum.Reception).ToList();
                    
                    foreach (var reception in receptionLst)
                    {
                        var mapInfoReportV2 = new MapInfoReportV2();
                        var recordShare = await recordShareRepository.FirstOrDefaultAsync(n => n.Id == reception.RecordSharedId);
                        if (recordShare == null)
                        {
                            continue;
                        }
                        mapInfoReportV2.MapInfoReports = new List<MapInfoReportV2>();
                        if (showSupplier)
                        {
                            var companyProfile = companyProfileQuery.Select(n=> new
                            {
                                n.Id,
                                n.CompanyName,
                                n.TenantId
                            }).FirstOrDefault(n => n.Id == recordShare.CompanyProfileId);
                        
                            if (companyProfile == null)
                            {
                                continue;
                            }

                            var company = companyQuery.FirstOrDefault(n => n.TenantId == companyProfile.TenantId);
                            mapInfoReportV2.TraceabilityCode = recordShare.TraceabilityCode;
                            mapInfoReportV2.DisplayText = companyProfile.CompanyName;
                            mapInfoReportV2.CompanyProfileId = companyProfile.Id;
                            mapInfoReportV2.ProductId = recordShare.ProductId;
                            mapInfoReportV2.Latitude = company?.Latitude;
                            mapInfoReportV2.Longitude = company?.Longitude;
                            mapInfoReportV2.CreatedTime = recordShare.CreationTime;
                            mapInfoReportV2.Position = position++;
                            await GetNodeOnMap(recordShare.Id, mapInfoReportV2.MapInfoReports, position++, showSupplier);
                            resultLst.Add(mapInfoReportV2);
                        }
                        else
                        {
                            await GetNodeOnMap(recordShare.Id, mapInfoReportV2.MapInfoReports, position++, showSupplier);
                        }
                    }
                    break;
                }
                case (int)StepSpecialEnum.Normal:
                {
                    await GetNodeOnMap(stepRecord.StepRecordId, resultLst, position, showSupplier);
                    break;
                }
            }
        }
    
        return resultLst;
    }
    private async Task GetNodeDairyReport(Guid stepRecordId, List<DiaryNode> diaryNodes)
    {
        var currentCulture = CultureInfo.CurrentUICulture;
        var languageCode = currentCulture.Name; 

        var entityStepRecordQuery = await entityStepRecordRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var processStepQuery = await processStepRepository.GetQueryableAsync();
        var stepRecords = (from stepRe in stepRecordQuery
            join entityStep in entityStepRecordQuery on stepRe.Id equals entityStep.StepRecordId
            join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
            where entityStep.EntityValue == stepRecordId
            select new DiaryNode
            {
                StepRecordId = stepRe.Id,
                IsSpecial = processStep.IsSpecial,
                StepName = processStep.Name,
                StepRecordCode = stepRe.Code,
                ProcessStepId = processStep.Id,
                CreatedTime = stepRe.CreationTime
            }).ToList();
        foreach (var stepRecord in stepRecords)
        {
            if (stepRecords == null)
            {
                continue;
            }

            switch (stepRecord.IsSpecial)
            {
                case (int)StepSpecialEnum.First:
                {
                    // get all reception by stepRecordId
                    var receptionQuery =
                        await recordReceptionV2Repository.GetListAsync(n => n.StepRecordId == stepRecord.StepRecordId);
                    foreach (var reception in receptionQuery)
                    {
                        var checkExist = diaryNodes.Any(n=>n.EntityId == reception.Id && n.StepRecordId == reception.StepRecordId);
                        if (checkExist)
                        {
                            continue;
                        }
                        var stepRecordObj = new DiaryNode
                        {
                            StepRecordId = stepRecord.StepRecordId,
                            IsSpecial = (int)StepSpecialEnum.First,
                            StepName = stepRecord.StepName,
                            StepRecordCode = stepRecord.StepRecordCode,
                            ProcessStepId = stepRecord.ProcessStepId,
                            EntityId = reception.Id,
                            CreatedTime = stepRecord.CreatedTime
                        };
                        if (reception is { ReceptionType: (int)EntityTypeEnum.Reception, RecordSharedId: not null })
                        {
                            stepRecordObj.ReceptionOrOriginFieldName = languageCode == "vi"? "Mã NL (Mắt xích trước)":"Reception";
                            var recordShare =
                                await recordShareRepository.FirstOrDefaultAsync(n => n.Id == reception.RecordSharedId);
                            if (recordShare == null)
                            {
                                continue;
                            }

                            var companySource =
                                await companyRepository.FirstOrDefaultAsync(n =>
                                    n.TenantId == recordShare.SourceTenantId);
                            if (companySource != null)
                            {
                                stepRecordObj.RedirectUrl = $"{companySource.GS1Code}-{recordShare.StartNumber}";
                            }

                            stepRecordObj.ReceptionOrOriginData = recordShare.TraceabilityCode;
                            stepRecordObj.RecordReceptionId = reception.Id;
                            diaryNodes.Add(stepRecordObj);
                        }
                        else if (reception is { ReceptionType: (int)EntityTypeEnum.Origin })
                        {
                            stepRecordObj.ReceptionOrOriginFieldName = languageCode == "vi"? "Vùng nguyên liệu":"Self-declared origin";
                            var district =
                                await districtRepository.FirstOrDefaultAsync(n => n.Id == reception.DistrictId);
                            if (district != null)
                            {
                                stepRecordObj.ReceptionOrOriginData = district.OriginalName;
                            }
                            diaryNodes.Add(stepRecordObj);
                        }
                    }

                    break;
                }
                case (int)StepSpecialEnum.Normal:
                    diaryNodes.Add(stepRecord);
                    await GetNodeDairyReport(stepRecord.StepRecordId, diaryNodes);
                    break;
                case (int)StepSpecialEnum.Last:
                    diaryNodes.Add(stepRecord);
                    await GetNodeDairyReport(stepRecord.StepRecordId, diaryNodes);
                    break;
            }
        }
    }
    
    #region Product
    public async Task<ProductReportDto> GetReportProductForPro(string gtinCode, string? lotId = null)
    {
        var result = new ProductReportDto();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["GtinCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await productRepository.FirstOrDefaultAsync(n=>n.GtinCode == gtinCode);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }

            result.ProductName = product.ProductName;
            result.GtinCode = product.GtinCode;
            result.Description = product.Description;
            result.ActivationDate = product.CreationTime.ToString("dd/MM/yyyy");
            var company = await companyRepository.FirstOrDefaultAsync(n =>n.TenantId == product.TenantId);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            if (company.Logo != null)
            {
                result.CompanyLogo = storageAppService.GetFileUrl(company.Logo);
            }

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();

            var productImages = imageStorageQuery.Where(n => n.RelatedEntityId == product.Id
                                                             && n.RelatedEntityType >= (int)ImageStorageEnum.Product
                                                             && n.RelatedEntityType <=
                                                             (int)ImageStorageEnum.ProductFile)
                    .Select(n => n).OrderBy(n=>n.ImageName).ToList();
            result.DocumentFiles = [];
            
            foreach (var image in productImages)
            {
                switch (image.RelatedEntityType)
                {
                    case (int)ImageStorageEnum.Product:
                        result.Images.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                    case (int)ImageStorageEnum.ProductYoutubeUrl:
                        result.VideoUrls.Add(image.ImageName);
                        break;
                    case (int)ImageStorageEnum.ProductFile:
                        result.DocumentFiles.Add(new ProductDocumentFileDto()
                        {
                            Id =  image.Id,
                            Name = image.ImageNameRaw??image.ImageName,
                            Url = storageAppService.GetFileUrl(image.ImageName)
                        });
                        break;
                    default:
                        result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
                        break;
                }
            }

            if (!string.IsNullOrEmpty(lotId))
            {
                var recordShare = await recordShareRepository.FirstOrDefaultAsync(n => n.ProductId == product.Id && lotId == n.LotId);
                if (recordShare != null)
                {
                    result.ActivationDate = recordShare.CreationTime.ToString("dd/MM/yyyy");
                }
            }
        }
        return result;
    }

    public async Task<ListResultDto<MapInfoReportV2>> GetReportMapInfoForProduct(string lotId, string gtinCode, int userType = 10)
    {
        var result = new List<MapInfoReportV2>();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["TraceCode:Error:gtinCodeNotExist"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        using (dataFilter.Disable<ISoftDelete>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();

            var productObj = await productRepository.FirstOrDefaultAsync(n => n.GtinCode == gtinCode);
            if (productObj == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:gtinCodeNotExist"]);
            }

            
            var company = companyQuery.FirstOrDefault(n => n.TenantId == productObj.TenantId);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var reportTemplate =
                await reportTemplateRepository.FirstOrDefaultAsync(n =>
                    n.UserType == userType && n.TenantId == company.TenantId) ?? new ReportTemplate
                {
                    AllowShowFrontNode = true,
                    AllowShowFullInfo = true,
                    AllowShowFollowNode = true,
                    AllowShowLink = true
                };
            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.ProductId == productObj.Id && n.LotId == lotId);
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            if (recordShare.PartnerId.HasValue)
            {
                var partner = await partnerRepository.FirstOrDefaultAsync(n => n.Id == recordShare.PartnerId);
                if (partner == null)
                {
                    throw new UserFriendlyException(L["TraceCode:Error:PartnerInvalid"]);
                }

                if (reportTemplate.AllowShowFollowNode == true)
                {
                    result.Add(new MapInfoReportV2
                    {
                        Latitude = partner.Latitude,
                        Longitude = partner.Longitude,
                        DisplayText = partner.Name,
                        Position = 0
                    });
                }
            }

            var mapInfo = new MapInfoReportV2
            {
                DisplayText = company.Name,
                Latitude = company.Latitude,
                Longitude = company.Longitude,
                Position = 1
            };
            if (reportTemplate.AllowShowFrontNode == true)
            {
                var resultLst = new List<MapInfoReportV2>();
                mapInfo.MapInfoReports = await GetNodeOnMap(recordShare.Id, resultLst, 2,
                    reportTemplate.AllowShowFullInfo ?? false);
            }

            result.Add(mapInfo);
        }

        return new ListResultDto<MapInfoReportV2>(result);
    }
    
    public async Task<CompanyReportDto> GetReportCompanyForProduct(string gtinCode, string? lotId = null)
    {
       var result = new CompanyReportDto();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        using (dataFilter.Disable<ISoftDelete>())
        {
            var product = await productRepository.FirstOrDefaultAsync(n=>n.GtinCode == gtinCode);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }
            Company company;
            if (product.CompanyId == null)
            {
                company = await companyRepository.FirstOrDefaultAsync(n => n.TenantId == product.TenantId);
            }
            else
            {
                company = await companyRepository.FirstOrDefaultAsync(n => n.Id == product.CompanyId);
            }

            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }
            
            result.Name = company.Name;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            // result.Description = company.Description;
            result.GS1Code = company.GS1Code;
            var country = await countryRepository.FirstOrDefaultAsync(n => n.Id == company.NationId);
            result.Country = country != null ? country.OriginalName : "";
            
            var recordShareObj = await recordShareRepository.FirstOrDefaultAsync(n=>n.ProductId == product.Id && lotId != null && n.LotId == lotId);
            if (recordShareObj == null)
            {
                return result;
            }
            
            var companyProfile = await  companyProfileRepository.FirstOrDefaultAsync(n => n.Id == recordShareObj.CompanyProfileId);
            if (companyProfile == null)
            {
                return result;
            }
            
            result.Name = companyProfile.CompanyName;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            result.Description = companyProfile.Description;
            result.GS1Code = company.GS1Code;

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();
            var companyProfileImages = imageStorageQuery.Where(n => n.RelatedEntityId == recordShareObj.CompanyProfileId
                                                                    && n.RelatedEntityType >=
                                                                    (int)ImageStorageEnum.CompanyProfileCertification)
                .Select(n => n).ToList();
            foreach (var image in companyProfileImages)
            {
                result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
            }   
        }

        return result;
    }

    public async Task<DiaryReportV2Dto> GetReportDiary(string gtinCode, string? lotId = null, int userType = 10)
    {
        var result = new DiaryReportV2Dto();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["TraceCode:Error:gtinCodeNotExist"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        using (dataFilter.Disable<ISoftDelete>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var processStepQuery = await processStepRepository.GetQueryableAsync();
        var processFieldQuery = await processFieldRepository.GetQueryableAsync();
        var fieldRecordQuery = await fieldRecordRepository.GetQueryableAsync();
        var processTemplateFieldQuery = await processFieldTemplateRepository.GetQueryableAsync();
        var supplierNameCache = new Dictionary<Guid, string>();
        var receptacleCodeCache = new Dictionary<Guid, string>();
        var partnerNameCache = new Dictionary<Guid, string>();
        var productNameCache = new Dictionary<Guid, string>();
        var optionValueCache = new Dictionary<Guid, string>();

        async Task<string?> GetSupplierNameAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            if (!supplierNameCache.TryGetValue(id, out var cachedValue))
            {
                var supplier = await supplierRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                cachedValue = supplier?.Name ?? string.Empty;
                supplierNameCache[id] = cachedValue;
            }

            return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
        }

        async Task<string?> GetReceptacleCodeAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            if (!receptacleCodeCache.TryGetValue(id, out var cachedValue))
            {
                var receptacle = await receptacleRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                cachedValue = receptacle?.Code ?? string.Empty;
                receptacleCodeCache[id] = cachedValue;
            }

            return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
        }

        async Task<string?> GetPartnerNameAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            if (!partnerNameCache.TryGetValue(id, out var cachedValue))
            {
                var partner = await partnerRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                cachedValue = partner?.Name ?? string.Empty;
                partnerNameCache[id] = cachedValue;
            }

            return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
        }

        async Task<string?> GetProductNameAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            if (!productNameCache.TryGetValue(id, out var cachedValue))
            {
                var product = await productRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                cachedValue = product?.ProductName ?? string.Empty;
                productNameCache[id] = cachedValue;
            }

            return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
        }

        async Task<string?> GetFieldOptionValueAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            if (!optionValueCache.TryGetValue(id, out var cachedValue))
            {
                var option = await processFieldOptionRepository.FirstOrDefaultAsync(entity => entity.Id == id);
                cachedValue = option?.OptionValue ?? string.Empty;
                optionValueCache[id] = cachedValue;
            }

            return string.IsNullOrEmpty(cachedValue) ? null : cachedValue;
        }
            
            var productObj = await productRepository.FirstOrDefaultAsync(n => n.GtinCode == gtinCode);
            if (productObj == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:gtinCodeNotExist"]);
            }
            
            var company = companyQuery.FirstOrDefault(n => n.TenantId == productObj.TenantId);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var recordShare = recordShareQuery.FirstOrDefault(n => n.ProductId == productObj.Id && n.LotId == lotId);
            if (recordShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var reportTemplate =
                await reportTemplateRepository.FirstOrDefaultAsync(n =>
                    n.UserType == userType && n.TenantId == company.TenantId) ?? new ReportTemplate
                {
                    AllowShowFrontNode = true,
                    AllowShowFullInfo = true,
                    AllowShowFollowNode = true,
                    AllowShowLink = true
                };
            var diaryNodes = new List<DiaryNode>();
            // this is las step record
            // This is point to start get previous step record
            var lastStepRecord = (from stepRe in stepRecordQuery
                join processStep in processStepQuery on stepRe.ProcessStepId equals processStep.Id
                where stepRe.Id == recordShare.StepRecordId
                select new DiaryNode
                {
                    StepRecordId = stepRe.Id,
                    IsSpecial = processStep.IsSpecial,
                    StepName = processStep.Name,
                    StepRecordCode = stepRe.Code,
                    ProcessStepId = processStep.Id,
                    EntityId = recordShare.Id
                }).FirstOrDefault();
            if (lastStepRecord != null)
            {
                diaryNodes.Add(lastStepRecord);
            }

            await GetNodeDairyReport(recordShare.Id, diaryNodes);
            foreach (var diaryNode in diaryNodes.GroupBy(n => n.ProcessStepId).ToList())
            {
                if (diaryNode.FirstOrDefault() == null)
                {
                    continue;
                }
                
                var diaryReportStepV2Dto = new DiaryReportStepV2Dto
                {
                    StepName = diaryNode.FirstOrDefault()!.StepName,
                    StepType =  diaryNode.FirstOrDefault()!.IsSpecial,
                    StepRecords = new List<DiaryStepRecordDto>()
                };
                var showLink = reportTemplate.AllowShowLink ?? false;
                foreach (var node in diaryNode)
                {
                    var fieldRecordData = (from fieldRecord in fieldRecordQuery
                        join templateFile in processTemplateFieldQuery on fieldRecord.ProcessFieldId equals templateFile
                                .ProcessFieldId
                            into temp
                        from templateFile in temp.DefaultIfEmpty()
                        join field in processFieldQuery on fieldRecord.ProcessFieldId equals field.Id
                        where fieldRecord.StepRecordId == node.StepRecordId
                              && fieldRecord.Selected == true
                              && templateFile.ReportTemplateId == reportTemplate.Id
                              && fieldRecord.EntityId == node.EntityId
                        select new
                        {
                            FieldName = field.Name,
                            fieldRecord.ResponseText,
                            field.DataType,
                            FieldOptionId = fieldRecord.ProcessFieldOptionId,
                            fieldRecord.ProcessFieldId,
                            fieldRecord.EntityId,
                            fieldRecord.EntityType,
                            field.Position,
                        }).GroupBy(n => new
                    {
                        n.EntityType,
                        n.EntityId
                    }).ToList();
                    var fieldRecords = new List<DiaryFieldRecordReportDto>();
                    var diaryStepRecordDto = new DiaryStepRecordDto
                    {
                        StepRecordCode = node.StepRecordCode,
                        ReceptionOrOriginFieldName = node.ReceptionOrOriginFieldName,
                        ReceptionOrOriginData = node.ReceptionOrOriginData,
                        FieldRecords = fieldRecords,
                        RedirectUrl = showLink && node.ReceptionOrOriginFieldName == nameof(EntityTypeEnum.Reception)
                            ? node.RedirectUrl
                            : "#"
                    };
                    foreach (var entityGroup in fieldRecordData)
                    {
                        fieldRecords = new List<DiaryFieldRecordReportDto>();
                        var fieldGroup = entityGroup.GroupBy(n => n.ProcessFieldId).ToList();
                        foreach (var field in fieldGroup)
                        {
                            var fieldObj = field.FirstOrDefault();
                            if (fieldObj == null)
                            {
                                continue;
                            }

                            var fieldReport = new DiaryFieldRecordReportDto
                            {
                                FieldName = fieldObj.FieldName,
                                DataType = fieldObj.DataType,
                                ResponseText = field.FirstOrDefault()?.ResponseText,
                                Position = fieldObj.Position
                            };
                            if (fieldObj.DataType <= (int)ProcessDataTypeEnum.MultiDropdown)
                            {
                                var optionTexts = new List<string>();
                                foreach (var optionId in field.Select(g => g.FieldOptionId)
                                             .Where(optionId => optionId != Guid.Empty)
                                             .Distinct())
                                {
                                    var optionValue = await GetFieldOptionValueAsync(optionId);
                                    if (!string.IsNullOrEmpty(optionValue))
                                    {
                                        optionTexts.Add(optionValue);
                                    }
                                }

                                fieldReport.ResponseText = optionTexts.JoinAsString(",");
                            }

                            switch (fieldObj.DataType)
                            {
                                case (int)ProcessDataTypeEnum.Supplier:
                                {
                                    var value = await GetSupplierNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Receptacle:
                                {
                                    var value = await GetReceptacleCodeAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Partner:
                                {
                                    var value = await GetPartnerNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                                case (int)ProcessDataTypeEnum.Product:
                                {
                                    var value = await GetProductNameAsync(fieldObj.FieldOptionId);
                                    if (!string.IsNullOrEmpty(value))
                                    {
                                        fieldReport.ResponseText = value;
                                    }

                                    break;
                                }
                            }

                            fieldRecords.Add(fieldReport);
                        }

                        diaryStepRecordDto.FieldRecords = fieldRecords.OrderBy(n=>n.Position).ToList();
                    }

                    diaryReportStepV2Dto.StepRecords.Add(diaryStepRecordDto);
                    // old version use show link in material trace code
                    // if (node.ReceptionOrOriginFieldName == nameof(EntityTypeEnum.Reception))
                    // {
                    //     result.MaterialTraceCodes.Add(new MaterialTraceCodeDto
                    //     {
                    //         MaterialTraceCode = node.ReceptionOrOriginData,
                    //         RedirectUrl = showLink ? node.RedirectUrl : null
                    //     });
                    // }
                }

                result.Steps.Add(diaryReportStepV2Dto);
            }
        }

        return result;
    }

    #endregion
    
    #region For-free-version
    public async Task<CompanyReportDto> GetReportCompanyForFree(string gtinCode)
    {
       var result = new CompanyReportDto();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        using (dataFilter.Disable<ISoftDelete>())
        {
            var product = await productRepository.FirstOrDefaultAsync(n=>n.GtinCode == gtinCode);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }
            
            Company company;
            if (product.CompanyId == null)
            {
                company = await companyRepository.FirstOrDefaultAsync(n => n.TenantId == product.TenantId);
            }
            else
            {
                company = await companyRepository.FirstOrDefaultAsync(n => n.Id == product.CompanyId);
            }

            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }
            
            result.Name = company.Name;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            result.GS1Code = company.GS1Code;
            var country = await countryRepository.FirstOrDefaultAsync(n => n.Id == company.NationId);
            result.Country = country != null ? country.OriginalName : "";
            
            // todo: get profile by company Id
            var companyProfile = await  companyProfileRepository.FirstOrDefaultAsync(n => n.CompanyId == product.CompanyId);
            if (companyProfile == null)
            {
                return result;
            }
            
            result.Name = companyProfile.CompanyName;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            result.Description = companyProfile.Description;
            result.GS1Code = company.GS1Code;

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();
            var companyProfileImages = imageStorageQuery.Where(n => n.RelatedEntityId == companyProfile.Id
                                                                    && n.RelatedEntityType >= (int)ImageStorageEnum.CompanyProfileCertification)
                .Select(n => n).ToList();
            foreach (var image in companyProfileImages)
            {
                result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
            }   
        }

        return result;
    }

    public async Task<IList<int>> GetNumberOfCompaniesJoin(int? year)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            year ??= DateTime.Today.Year;
            var companies = await companyRepository.GetListAsync(n=>n.CreationTime.Year == year);
            var monthCounts = Enumerable.Range(1, 12).ToList();

            return monthCounts.Select(month => companies.Count(n => n.CreationTime.Month == month)).ToList();
        }
    }

    public async Task<ProductReportDto> GetReportProductForFree(string gtinCode)
    {
        var result = new ProductReportDto();
        if (string.IsNullOrEmpty(gtinCode))
        {
            throw new UserFriendlyException(L["GtinCode:Error:Invalid"]);
        }

        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await productRepository.FirstOrDefaultAsync(n=>n.GtinCode == gtinCode);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }

            result.ProductName = product.ProductName;
            result.GtinCode = product.GtinCode;
            result.Description = product.Description;
            result.ActivationDate = product.CreationTime.ToString("dd/MM/yyyy");
            Company company;
            if (product.CompanyId == null)
            {
                company = await companyRepository.FirstOrDefaultAsync(n =>n.TenantId == product.TenantId);

            }else
            {
                company = await companyRepository.FirstOrDefaultAsync(n => n.Id == product.CompanyId);
            }
            
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            if (company.Logo != null)
            {
                result.CompanyLogo = storageAppService.GetFileUrl(company.Logo);
            }

            var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();

            var productImages = imageStorageQuery.Where(n => n.RelatedEntityId == product.Id
                                                             && (n.RelatedEntityType == (int)ImageStorageEnum.Product
                                                                 || n.RelatedEntityType ==
                                                                 (int)ImageStorageEnum.ProductCertification))
                .Select(n => n).OrderBy(n=>n.ImageName).ToList();
            result.DocumentFiles = [];
            
            foreach (var image in productImages)
            {
                if (image.RelatedEntityType == (int)ImageStorageEnum.Product)
                {
                    result.Images.Add(storageAppService.GetFileUrl(image.ImageName));
                }
                else
                {
                    result.CertificationImages.Add(storageAppService.GetFileUrl(image.ImageName));
                }
            }
        }
        return result;
    }
    
    #endregion
}
