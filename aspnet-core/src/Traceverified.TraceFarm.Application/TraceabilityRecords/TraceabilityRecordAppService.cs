using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Traceverified.TraceFarm.TraceabilityRecords.Reports;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordAppService : CrudAppService<
        TraceabilityRecord,
        TraceabilityRecordDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateTraceabilityRecordDto>,
    ITraceabilityRecordAppService
{
    private readonly IRepository<CompanyProfile, Guid> _companyProfileRepository;
    private readonly IRepository<Company, Guid> _companyRepository;
    private readonly IRepository<LocationCountry, Guid> _countryRepository;
    private readonly IDataFilter _dataFilter;
    private readonly IRepository<LocationDistrict, Guid> _districtRepository;
    private readonly IRepository<ImageStorage, Guid> _imageStorageRepository;
    private readonly IRepository<Partner, Guid> _partnerRepository;
    private readonly IRepository<ProcessFieldOption, Guid> _processFieldOptionRepository;
    private readonly IRepository<ProcessField, Guid> _processFieldRepository;
    private readonly IRepository<ProcessFieldResponse, Guid> _processFieldResponseRepository;
    private readonly IRepository<Process, Guid> _processRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<ProcessStepResponse, Guid> _processStepResponseRepository;
    private readonly IRepository<Product, Guid> _productRepository;
    private readonly IRepository<RecordReception, Guid> _recordReceptionRepository;
    private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
    private readonly IStorageAppService _storageAppService;
    private readonly IRepository<TraceabilityRecord, Guid> _traceRecordRepository;
    private readonly IRepository<TraceabilityRecordShare, Guid> _traceRecordShareRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public TraceabilityRecordAppService(IRepository<TraceabilityRecord, Guid> repository,
        IRepository<CompanyProfile, Guid> companyProfileRepository,
        IRepository<ProcessStep, Guid> processStepRepository, IRepository<IdentityUser, Guid> userRepository,
        IRepository<Product, Guid> productRepository, IRepository<Partner, Guid> partnerRepository,
        IRepository<TraceabilityRecordShare, Guid> traceRecordShareRepository,
        IRepository<ProcessField, Guid> processFieldRepository,
        IRepository<ProcessFieldResponse, Guid> processFieldResponseRepository,
        IRepository<ProcessFieldOption, Guid> processFieldOptionRepository,
        IRepository<RecordReception, Guid> recordReceptionRepository,
        IRepository<LocationDistrict, Guid> districtRepository,
        IRepository<ProcessStepResponse, Guid> processStepResponseRepository,
        IDataFilter<ISoftDelete> softDeleteFilter, IDataFilter dataFilter, IRepository<Company, Guid> companyRepository,
        IRepository<ImageStorage, Guid> imageStorageRepository, IStorageAppService storageAppService,
        IRepository<Process, Guid> processResponsitory,
        IRepository<LocationCountry, Guid> countryRepository) : base(repository)
    {
        _traceRecordRepository = repository;
        _companyProfileRepository = companyProfileRepository;
        _processStepRepository = processStepRepository;
        _userRepository = userRepository;
        _productRepository = productRepository;
        _partnerRepository = partnerRepository;
        _traceRecordShareRepository = traceRecordShareRepository;
        _processFieldRepository = processFieldRepository;
        _processFieldResponseRepository = processFieldResponseRepository;
        _processFieldOptionRepository = processFieldOptionRepository;
        _recordReceptionRepository = recordReceptionRepository;
        _districtRepository = districtRepository;
        _processStepResponseRepository = processStepResponseRepository;
        _softDeleteFilter = softDeleteFilter;
        _dataFilter = dataFilter;
        _companyRepository = companyRepository;
        _imageStorageRepository = imageStorageRepository;
        _storageAppService = storageAppService;
        _processRepository = processResponsitory;
        _countryRepository = countryRepository;
    }

    public async Task<PagedResultDto<TraceabilityRecordingDto>> GetListRecordingAsync(
        TraceabilityRecordFilterDto filter)
    {
        var query = await _traceRecordRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
        var userQuery = await _userRepository.GetQueryableAsync();
        var stepQuery = await _processStepRepository.GetQueryableAsync();
        var traceRecordFilter = query.Where(n => n.Status != (int)TraceabilityRecordEnum.Done)
            .WhereIf(!string.IsNullOrEmpty(filter.Filter), n => n.Code.ToLower().Contains(filter.Filter.ToLower()))
            .WhereIf(filter.CompanyProfileId.HasValue, n => n.CompanyProfileId == filter.CompanyProfileId)
            .WhereIf(filter.ProcessId.HasValue, n => n.ProcessId == filter.ProcessId)
            .WhereIf(filter.FromDate.HasValue, n => n.CreationTime >= filter.FromDate)
            .WhereIf(filter.ToDate.HasValue, n => n.CreationTime <= filter.ToDate);
        var joinQuery = from traceRecord in traceRecordFilter
            join profile in companyProfileQuery on traceRecord.CompanyProfileId equals profile.Id
            join user in userQuery on traceRecord.CreatorId equals user.Id
            join step in stepQuery on traceRecord.CurrentStepId equals step.Id
            select new TraceabilityRecordingDto
            {
                Id = traceRecord.Id,
                Code = traceRecord.Code,
                CreationTime = traceRecord.CreationTime,
                CompanyProfileName = profile.Name,
                CreatedBy = user.Name,
                CurrentStepName = step.Name
            };
        var result = joinQuery
            .OrderBy(filter.Sorting ?? "CreationTime")
            .Skip(filter.SkipCount)
            .Take(filter.MaxResultCount).ToList();
        return new PagedResultDto<TraceabilityRecordingDto>(joinQuery.Count(), result);
    }

    public async Task<PagedResultDto<TraceabilityRecordDoneDto>> GetListDoneAsync(TraceabilityRecordFilterDto filter)
    {
        var query = await _traceRecordRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
        var companyQuery = await _companyRepository.GetQueryableAsync();
        var userQuery = await _userRepository.GetQueryableAsync();
        var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
        var productQuery = await _productRepository.GetQueryableAsync();
        var traceRecordFilter = query.Where(n => n.Status == (int)TraceabilityRecordEnum.Done)
            .WhereIf(!string.IsNullOrEmpty(filter.Filter), n => n.Code.ToLower().Contains(filter.Filter.ToLower()))
            .WhereIf(filter.CompanyProfileId.HasValue, n => n.CompanyProfileId == filter.CompanyProfileId)
            .WhereIf(filter.ProcessId.HasValue, n => n.ProcessId == filter.ProcessId)
            .WhereIf(filter.FromDate.HasValue, n => n.CreationTime >= filter.FromDate)
            .WhereIf(filter.ToDate.HasValue, n => n.CreationTime <= filter.ToDate);
        var joinQuery = from traceRecord in traceRecordFilter
            join profile in companyProfileQuery on traceRecord.CompanyProfileId equals profile.Id
            join company in companyQuery on profile.TenantId equals company.TenantId
            join user in userQuery on traceRecord.CreatorId equals user.Id
            select new TraceabilityRecordDoneDto
            {
                Id = traceRecord.Id,
                Code = traceRecord.Code,
                CreationTime = traceRecord.CreationTime,
                CreatedBy = user.Name,
                ViewTraceabilityUrl = company.GS1Code
            };
        var result = joinQuery
            .OrderBy(filter.Sorting ?? "CreationTime")
            .Skip(filter.SkipCount)
            .Take(filter.MaxResultCount).ToList();

        foreach (var traceabilityRecord in result)
        {
            var shareData = from traceRecordShare in traceRecordShareQuery
                join product in productQuery on traceRecordShare.ProductId equals product.Id
                where traceRecordShare.TraceabilityRecordId == traceabilityRecord.Id
                select new
                {
                    traceRecordShare.Id,
                    product.ProductName,
                    TraceabilityCode = traceRecordShare.StartNumber + " - " + traceRecordShare.EndNumber,
                    traceRecordShare.StartNumber
                };
            if (shareData.Any())
            {
                var shareDataList = shareData.Min(n => n.StartNumber);
                traceabilityRecord.ViewTraceabilityUrl = traceabilityRecord.ViewTraceabilityUrl + '-' + shareDataList;
            }

            traceabilityRecord.Products = shareData.OrderBy(n => n.Id).Select(n => new DropdownItemBaseDto
            {
                Id = n.Id,
                Name = n.ProductName
            }).ToList();
            traceabilityRecord.TraceabilityCodes = shareData.OrderBy(n => n.Id).Select(n => new DropdownItemBaseDto
            {
                Id = n.Id,
                Name = n.TraceabilityCode
            }).ToList();
        }

        return new PagedResultDto<TraceabilityRecordDoneDto>(joinQuery.Count(), result);
    }

    // todo: implement GetListShareAsync
    public async Task<PagedResultDto<TraceabilityRecordShareDto>> GetListShareAsync(TraceabilityRecordFilterDto filter)
    {
        var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
        var query = await _traceRecordRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
        var partnerQuery = await _partnerRepository.GetQueryableAsync();
        var productQuery = await _productRepository.GetQueryableAsync();
        var userQuery = await _userRepository.GetQueryableAsync();

        var traceRecordFilter = query.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(filter.Filter), n => n.Code.ToLower().Contains(filter.Filter.ToLower()))
            .WhereIf(filter.CompanyProfileId.HasValue, n => n.CompanyProfileId == filter.CompanyProfileId)
            .WhereIf(filter.ProcessId.HasValue, n => n.ProcessId == filter.ProcessId)
            .WhereIf(filter.FromDate.HasValue, n => n.CreationTime >= filter.FromDate)
            .WhereIf(filter.ToDate.HasValue, n => n.CreationTime <= filter.ToDate);

        var joinQuery = from traceRecord in traceRecordFilter
            join traceShare in traceRecordShareQuery on traceRecord.Id equals traceShare.TraceabilityRecordId
            join partner in partnerQuery on traceShare.SharedTenantId equals partner.Id
            join profile in companyProfileQuery on traceRecord.CompanyProfileId equals profile.Id
            join user in userQuery on traceRecord.CreatorId equals user.Id
            select new TraceabilityRecordShareDto
            {
                Id = traceRecord.Id,
                Code = traceRecord.Code,
                SendDate = traceRecord.CreationTime,
                SharedBy = user.Name,
                ContractNumber = traceShare.ContractNumber
            };
        var result = joinQuery
            .OrderBy(filter.Sorting ?? "CreationTime")
            .Skip(filter.SkipCount)
            .Take(filter.MaxResultCount).ToList();
        return new PagedResultDto<TraceabilityRecordShareDto>(traceRecordFilter.Count(), result);
    }

    // todo: implement GetListReceivedAsync
    public async Task<PagedResultDto<TraceabilityRecordReceivedDto>> GetListReceivedAsync(
        TraceabilityRecordFilterDto filter)
    {
        var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
        var query = await _traceRecordRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
        var partnerQuery = await _partnerRepository.GetQueryableAsync();
        var productQuery = await _productRepository.GetQueryableAsync();
        var userQuery = await _userRepository.GetQueryableAsync();

        var traceRecordFilter = query.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(filter.Filter), n => n.Code.ToLower().Contains(filter.Filter.ToLower()))
            .WhereIf(filter.CompanyProfileId.HasValue, n => n.CompanyProfileId == filter.CompanyProfileId)
            .WhereIf(filter.ProcessId.HasValue, n => n.ProcessId == filter.ProcessId)
            .WhereIf(filter.FromDate.HasValue, n => n.CreationTime >= filter.FromDate)
            .WhereIf(filter.ToDate.HasValue, n => n.CreationTime <= filter.ToDate);
        var joinQuery = from traceRecord in traceRecordFilter
            join profile in companyProfileQuery on traceRecord.CompanyProfileId equals profile.Id
            join user in userQuery on traceRecord.CreatorId equals user.Id
            select new TraceabilityRecordReceivedDto
            {
                Id = traceRecord.Id,
                Code = traceRecord.Code,
                ReceivedDate = traceRecord.CreationTime,
                SharedBy = user.Name
            };
        var result = joinQuery
            .OrderBy(filter.Sorting ?? "CreationTime")
            .Skip(filter.SkipCount)
            .Take(filter.MaxResultCount).ToList();
        return new PagedResultDto<TraceabilityRecordReceivedDto>(traceRecordFilter.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetStepDropdownAsync(Guid processId)
    {
        var query = (await _processStepRepository.GetListAsync())
            .Where(x => !x.IsDeleted && x.ProcessId == processId)
            .OrderBy(n => n.IsSpecial)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<ProcessFieldDto>> GetFieldByStepAndRecord(Guid processStepId,
        Guid traceabilityRecordId)
    {
        var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
        var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();

        var result = processFieldQuery.Where(n => n.IsDeleted == false && n.StepId == processStepId)
            .Select(n => new ProcessFieldDto
            {
                Id = n.Id,
                Name = n.Name,
                DataType = n.DataType,
                IsObligatory = n.IsObligatory,
                Position = n.Position,
                StepId = n.StepId,
                Options = processFieldOptionQuery.Where(x => x.ProcessFieldId == n.Id && !n.IsDeleted).Select(x =>
                    new ProcessFieldOptionDto
                    {
                        OptionValue = x.OptionValue,
                        Id = x.Id
                    }).ToList()
            }).ToList();
        return new PagedResultDto<ProcessFieldDto>(result.Count(), result);
    }

    public override async Task<TraceabilityRecordDto> CreateAsync(CreateUpdateTraceabilityRecordDto input)
    {
        input.TenantId = CurrentTenant.Id;
        var stepQuery = await _processStepRepository.GetQueryableAsync();

        var processStep = stepQuery.FirstOrDefault(n =>
            n.ProcessId == input.ProcessId && n.IsSpecial == (int)StepSpecialEnum.First);
        if (processStep != null)
        {
            input.CurrentStepId = processStep.Id;
            input.Status = (int)TraceabilityRecordEnum.Recording;
        }
        else
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        var output = await base.CreateAsync(input);


        return output;
    }

    public async Task<bool> DeleteReceptionAsync(Guid id)
    {
        await _recordReceptionRepository.DeleteAsync(id);
        var processStepResponseQuery = await _processStepResponseRepository.GetQueryableAsync();
        var processStepResponse = processStepResponseQuery.Where(n =>
            n.EntityValue == id && n.EntityTypeId == (int)ProcessStepResponseEnum.RecordReception).ToList();
        await _processFieldResponseRepository.DeleteAsync(n =>
            processStepResponse.Select(g => g.Id).ToList().Contains(n.ProcessStepResponseId));
        await _processStepResponseRepository.DeleteManyAsync(processStepResponse);
        return true;
    }

    public async Task<ListResultDto<RecordReceptionDto>> GetReceptionAsync(Guid processStepId,
        Guid traceabilityRecordId)
    {
        var query = (await _recordReceptionRepository.GetQueryableAsync())
            .Where(n => n.TraceabilityRecordId == traceabilityRecordId && n.ProcessStepId == processStepId)
            .Select(n => new RecordReceptionDto
            {
                Id = n.Id,
                ReceptionType = n.ReceptionType,
                TraceabilityRecordSharedId = n.TraceabilityRecordSharedId,
                CountryId = n.CountryId,
                ProvinceId = n.ProvinceId,
                DistrictId = n.DistrictId
            }).ToList();
        foreach (var item in query)
        {
            switch (item)
            {
                case { ReceptionType: (int)RecordReceptionEnum.Origin, DistrictId: not null }:
                {
                    var districtObj = await _districtRepository.GetAsync(item.DistrictId.Value);
                    item.TraceabilityRecordCode = districtObj.OriginalName;
                    break;
                }
                case { ReceptionType: (int)RecordReceptionEnum.Replication, TraceabilityRecordSharedId: not null }:
                {
                    var traceRecordShareObj =
                        await _traceRecordShareRepository.GetAsync(item.TraceabilityRecordSharedId.Value);
                    item.TraceabilityRecordCode = traceRecordShareObj.TraceabilityCode;
                    break;
                }
            }
        }

        return new ListResultDto<RecordReceptionDto>(query);
    }

    public async Task<bool> SetDoneAsync(Guid traceabilityRecordId)
    {
        var record = await _traceRecordRepository.GetAsync(traceabilityRecordId);
        if (record == null)
        {
            throw new UserFriendlyException(L["Record:Error:NotExists"]);
        }

        record.Status = (int)TraceabilityRecordEnum.Done;
        await _traceRecordRepository.UpdateAsync(record);
        return true;
    }

    public Task<ListResultDto<RecordReceptionDto>> GetRecordSharedAsync(Guid processStepId, Guid traceabilityRecordId)
    {
        throw new NotImplementedException();
    }

    public async Task<ListResultDto<TraceabilityRecordShareDto>> GetRecordWasSharedAsync(Guid traceabilityRecordId)
    {
        var productQuery = await _productRepository.GetQueryableAsync();
        var partnerQuery = await _partnerRepository.GetQueryableAsync();
        var query = (await _traceRecordShareRepository.GetQueryableAsync())
            .Where(n => n.TraceabilityRecordId == traceabilityRecordId)
            .Select(n => new TraceabilityRecordShareDto
            {
                Id = n.Id,
                TraceabilityCode = n.TraceabilityCode,
                SendDate = n.CreationTime,
                ContractNumber = n.ContractNumber,
                PartnerName = partnerQuery.FirstOrDefault(o => o.Id == n.SharedTenantId)!.Name,
                ProductName = productQuery.FirstOrDefault(g => g.Id == n.ProductId)!.ProductName
            }).ToList();
        return new ListResultDto<TraceabilityRecordShareDto>(query);
    }

    public async Task<string> GenerateRecordCodeAsync()
    {
        using (_softDeleteFilter.Disable())
        {
            var recordCount = await _traceRecordRepository.GetCountAsync();
            var recordCode = recordCount + 1;
            return recordCode.ToString("D6");
        }
    }

    public async Task<ListResultDto<ProcessFieldResponseDto>> GetStepResponse(Guid traceRecordId,
        Guid processStepId, Guid? entityValue)
    {
        var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
        var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();
        var processStepIdQuery = await _processStepRepository.GetQueryableAsync();
        var processStepResponseQuery = await _processStepResponseRepository.GetQueryableAsync();
        var stepObj = await _processStepRepository.GetAsync(n =>
            n.Id == processStepId);
        if (stepObj == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        var stepResponse = stepObj.IsSpecial switch
        {
            (int)StepSpecialEnum.First when entityValue.HasValue => processStepResponseQuery.Where(n =>
                    n.TraceabilityRecordId == traceRecordId && n.ProcessStepId == processStepId &&
                    n.EntityTypeId == (int)ProcessStepResponseEnum.RecordReception &&
                    n.EntityValue == entityValue.Value)
                .ToList(),
            (int)StepSpecialEnum.Last when entityValue.HasValue => processStepResponseQuery.Where(n =>
                n.TraceabilityRecordId == traceRecordId && n.ProcessStepId == processStepId &&
                n.EntityTypeId == (int)ProcessStepResponseEnum.TraceabilityRecordShare &&
                n.EntityValue == entityValue.Value).ToList(),
            _ => processStepResponseQuery.Where(n =>
                n.TraceabilityRecordId == traceRecordId && n.ProcessStepId == processStepId &&
                n.EntityTypeId == (int)ProcessStepResponseEnum.None).ToList()
        };

        var result = new List<ProcessFieldResponseDto>();

        if (stepResponse.Count == 0)
        {
            // get data when don't have response
            result = processFieldQuery.Where(n => n.StepId == processStepId && !n.IsDeleted)
                .Select(n => new ProcessFieldResponseDto
                {
                    Id = n.Id,
                    ProcessFieldId = n.Id,
                    Name = n.Name,
                    DataType = n.DataType,
                    IsObligatory = n.IsObligatory,
                    Position = n.Position,
                    Options = processFieldOptionQuery.Where(x => x.ProcessFieldId == n.Id && !n.IsDeleted)
                        .Select(x =>
                            new ProcessFieldOptionResponseDto
                            {
                                Name = x.OptionValue,
                                Id = x.Id,
                                Selected = false,
                                ResponseText = ""
                            }).ToList()
                }).ToList();
            return new ListResultDto<ProcessFieldResponseDto>(result);
        }

        foreach (var step in stepResponse)
        {
            result.AddRange((await _processFieldResponseRepository.GetListAsync(n =>
                    n.ProcessStepResponseId == step.Id)).GroupBy(n => n.ProcessFieldId).Select(n =>
                    new ProcessFieldResponseDto
                    {
                        Id = n.Key,
                        ProcessFieldId = n.Key,
                        ProcessStepResponseId = step.Id,
                        Name = _processFieldRepository.GetAsync(n.Key).Result.Name,
                        DataType = _processFieldRepository.GetAsync(n.Key).Result.DataType,
                        IsObligatory = _processFieldRepository.GetAsync(n.Key).Result.IsObligatory,
                        Position = _processFieldRepository.GetAsync(n.Key).Result.Position,
                        ExecutorId = n.FirstOrDefault()!.ExecutorId,
                        Options = n.Select(x => new ProcessFieldOptionResponseDto
                        {
                            Name = _processFieldOptionRepository.GetAsync(x.ProcessFieldOptionId).Result.OptionValue,
                            Id = x.Id,
                            Selected = x.Selected ?? false,
                            ResponseText = x.ResponseText,
                            ExecutorId = x.ExecutorId
                        }).ToList()
                    }).ToList()
            );
        }

        return new ListResultDto<ProcessFieldResponseDto>(result);
    }

    public async Task<RecordReceptionDto> SaveReceptionAsync(CreateUpdateRecordReceptionDto input)
    {
        // var checkRecordReception = await _recordReceptionRepository.FirstOrDefaultAsync(n =>
        //     n.TraceabilityRecordId == input.TraceabilityRecordId && n.ProcessStepId == input.ProcessStepId &&
        //     n.ReceptionType == input.ReceptionType);
        // if (checkRecordReception != null)
        // {
        //     checkRecordReception.TraceabilityRecordSharedId = input.TraceabilityRecordSharedId;
        //     checkRecordReception.CountryId = input.CountryId;
        //     checkRecordReception.ProvinceId = input.ProvinceId;
        //     checkRecordReception.DistrictId = input.DistrictId;
        //     await _recordReceptionRepository.UpdateAsync(checkRecordReception);
        //     return ObjectMapper.Map<RecordReception, RecordReceptionDto>(checkRecordReception);
        // }

        var recordReception = new RecordReception
        {
            TraceabilityRecordId = input.TraceabilityRecordId,
            ProcessStepId = input.ProcessStepId,
            ReceptionType = input.ReceptionType,
            TraceabilityRecordSharedId = input.TraceabilityRecordSharedId,
            CountryId = input.CountryId,
            ProvinceId = input.ProvinceId,
            DistrictId = input.DistrictId
        };
        await _recordReceptionRepository.InsertAsync(recordReception);
        return ObjectMapper.Map<RecordReception, RecordReceptionDto>(recordReception);
    }

    public async Task<TraceabilityRecordShareDto> SaveRecordShare(CreateUpdateRecordShareDto input)
    {
        // var recordShare = await _traceRecordShareRepository.FirstOrDefaultAsync(n =>
        //     n.TraceabilityRecordId == input.TraceabilityRecordId && n.SharedTenantId == input.SharedTenantId);
        // if (recordShare != null)
        // {
        //     recordShare.TraceabilityRecordId = input.TraceabilityRecordId;
        //     // recordShare.SharedTenantId = input.SharedTenantId;
        //     recordShare.StartNumber = input.StartNumber ?? 0;    
        //     recordShare.EndNumber = input.EndNumber;
        //     recordShare.ContractNumber = input.ContractNumber;
        //     recordShare.TraceabilityCode = input.TraceabilityCode;
        //     recordShare.Status = input.Status;
        //     recordShare.ProductId = input.ProductId;
        //     recordShare.SourceTenantId = CurrentTenant.Id;
        //     await _traceRecordShareRepository.UpdateAsync(recordShare);
        //     return ObjectMapper.Map<TraceabilityRecordShare, TraceabilityRecordShareDto>(recordShare);
        // }
        var recordShare = new TraceabilityRecordShare
        {
            TraceabilityRecordId = input.TraceabilityRecordId,
            SharedTenantId = input.SharedTenantId,
            StartNumber = input.StartNumber ?? 0,
            EndNumber = input.EndNumber,
            ContractNumber = input.ContractNumber,
            TraceabilityCode = input.TraceabilityCode,
            ProductId = input.ProductId,
            SourceTenantId = CurrentTenant.Id,
            Status = input.Status
        };
        await _traceRecordShareRepository.InsertAsync(recordShare);
        return ObjectMapper.Map<TraceabilityRecordShare, TraceabilityRecordShareDto>(recordShare);
    }

    public async Task<bool> SaveRecordResponseAsync(CreateUpdateRecordResponseDto input)
    {
        var processStepResponse = new ProcessStepResponse();
        if (input.ProcessStepResponseId.HasValue && input.ProcessStepResponseId.Value != Guid.Empty)
        {
            processStepResponse =
                await _processStepResponseRepository.FirstOrDefaultAsync(n =>
                    input.ProcessStepResponseId.Value == n.Id);
            if (processStepResponse != null && input.IsDone)
            {
                if (processStepResponse.EntityTypeId is (int)ProcessStepResponseEnum.RecordReception
                    or (int)ProcessStepResponseEnum.TraceabilityRecordShare)
                {
                    var processStepResponseQuery = await _processStepResponseRepository.GetQueryableAsync();

                    var stepResponse = processStepResponseQuery.Where(n =>
                        n.TraceabilityRecordId == input.TraceabilityRecordId
                        && n.ProcessStepId == input.ProcessStepId && n.EntityTypeId == input.EntityType).ToList();
                    foreach (var sRes in stepResponse)
                    {
                        sRes.IsDone = true;
                    }

                    await _processStepResponseRepository.UpdateManyAsync(stepResponse);
                }
                else
                {
                    processStepResponse.IsDone = input.IsDone;
                    await _processStepResponseRepository.UpdateAsync(processStepResponse);
                }
            }
        }
        else
        {
            processStepResponse.TraceabilityRecordId = input.TraceabilityRecordId;
            processStepResponse.ProcessStepId = input.ProcessStepId;
            processStepResponse.EntityTypeId = input.EntityType;
            processStepResponse.EntityValue = input.EntityValue;
            await _processStepResponseRepository.InsertAsync(processStepResponse);
        }

        var listFieldResponseCreate = new List<ProcessFieldResponse>();
        var listFieldResponseUpdate = new List<ProcessFieldResponse>();
        foreach (var fieldResponse in input.FieldResponses)
        {
            foreach (var option in fieldResponse.Options)
            {
                var processFieldResponse =
                    await _processFieldResponseRepository.FirstOrDefaultAsync(n => n.Id == option.Id);
                if (processFieldResponse == null)
                {
                    listFieldResponseCreate.Add(new ProcessFieldResponse
                    {
                        ProcessFieldId = fieldResponse.ProcessFieldId,
                        ResponseText = option.ResponseText,
                        ProcessStepResponseId = processStepResponse.Id,
                        ProcessFieldOptionId = option.Id,
                        Selected = option.Selected,
                        ExecutorId = fieldResponse.ExecutorId
                    });
                }
                else
                {
                    processFieldResponse.ResponseText = option.ResponseText;
                    processFieldResponse.Selected = option.Selected;
                    processFieldResponse.ExecutorId = fieldResponse.ExecutorId;
                    listFieldResponseUpdate.Add(processFieldResponse);
                }
            }
        }

        if (listFieldResponseCreate.Count > 0)
        {
            await _processFieldResponseRepository.InsertManyAsync(listFieldResponseCreate);
        }

        if (listFieldResponseUpdate.Count > 0)
        {
            await _processFieldResponseRepository.UpdateManyAsync(listFieldResponseUpdate);
        }

        return true;
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetReceptionDropdownAsync(Guid processStepId,
        Guid traceabilityRecordId)
    {
        var query = (await _traceRecordShareRepository.GetListAsync())
            .Where(x => x.SharedTenantId == CurrentTenant.Id)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.TraceabilityCode
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<int> GenerateStartNumber()
    {
        var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
        var traceRecordShare = traceRecordShareQuery
            .Select(n => n.EndNumber);
        if (traceRecordShare.Any())
        {
            return traceRecordShare.Max() + 1;
        }

        return 1;
    }

    #region Report form

    public async Task<ListResultDto<MapInfoReport>> GetReportMapInfo(string traceCode)
    {
        var result = new List<MapInfoReport>();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var mapInfo = new MapInfoReport
            {
                DisplayText = company.Name,
                Latitude = company.Latitude,
                Longitude = company.Longitude
            };
            result.Add(mapInfo);
        }

        return new ListResultDto<MapInfoReport>(result);
    }

    public async Task<ProductReportDto> GetReportProduct(string traceCode)
    {
        var result = new ProductReportDto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
            
            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var traceShare = traceRecordShareQuery
                .FirstOrDefault(n => n.StartNumber >= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (traceShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var product = await _productRepository.GetAsync(traceShare.ProductId);
            if (product == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:ProductInvalid"]);
            }

            result.ProductName = product.ProductName;
            result.GtinCode = product.GtinCode;
            result.Description = product.Description;
            result.ActivationDate = traceShare.CreationTime.ToString("dd/MM/yyyy");
            var imageStorageQuery = await _imageStorageRepository.GetQueryableAsync();
            var productImages = imageStorageQuery.Where(n => n.RelatedEntityId == product.Id
                                                             && (n.RelatedEntityType == (int)ImageStorageEnum.Product
                                                                 || n.RelatedEntityType ==
                                                                 (int)ImageStorageEnum.ProductCertification))
                .Select(n => n).ToList();
            foreach (var image in productImages)
            {
                if (image.RelatedEntityType == (int)ImageStorageEnum.Product)
                {
                    result.Images.Add(_storageAppService.GetBase64Image(image.ImageName));
                }
                else
                {
                    result.CertificationImages.Add(_storageAppService.GetBase64Image(image.ImageName));
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

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
            var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
            var traceRecordQuery = await _traceRecordRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);

            var traceShare = traceRecordShareQuery
                .FirstOrDefault(n => n.StartNumber >= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (traceShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var traceRecord = traceRecordQuery.FirstOrDefault(n => n.Id == traceShare.TraceabilityRecordId);
            if (traceRecord == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceRecordInvalid"]);
            }

            var companyProfile = companyProfileQuery.FirstOrDefault(n => n.Id == traceRecord.CompanyProfileId);
            if (companyProfile == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyProfileInvalid"]);
            }

            result.Name = companyProfile.Name;
            result.Address = company.Address;
            result.PhoneNumber = company.PhoneNumber;
            result.EmailAddress = company.EmailAddress;
            result.WebsiteUrl = company.WebsiteUrl;
            result.Description = companyProfile.Description;
            result.GS1Code = company.GS1Code;
            var country = await _countryRepository.FirstOrDefaultAsync(n => n.Id == company.NationId);
            result.Country = country != null ? country.OriginalName : "";

            var imageStorageQuery = await _imageStorageRepository.GetQueryableAsync();
            var companyProfileImages = imageStorageQuery.Where(n => n.RelatedEntityId == traceRecord.CompanyProfileId
                                                                    && n.RelatedEntityType >=
                                                                    (int)ImageStorageEnum.CompanyProfileCertification)
                .Select(n => n).ToList();
            foreach (var image in companyProfileImages)
            {
                result.CertificationImages.Add(_storageAppService.GetBase64Image(image.ImageName));
            }
        }

        return result;
    }

    public async Task<DiaryReportDto> GetReportDiary(string traceCode)
    {
        var result = new DiaryReportDto();
        var traceCodeSplit = traceCode.Split('-');
        if (traceCodeSplit.Length != 2)
        {
            throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
        }

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var traceRecordShareQuery = await _traceRecordShareRepository.GetQueryableAsync();
            var traceRecordQuery = await _traceRecordRepository.GetQueryableAsync();
            var processStepQuery = await _processStepRepository.GetQueryableAsync();
            var processStepResponseQuery = await _processStepResponseRepository.GetQueryableAsync();
            var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
            var processFieldResponseQuery = await _processFieldResponseRepository.GetQueryableAsync();
            var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();
            var processQuery = await _processRepository.GetQueryableAsync();
            var receptionQuery = await _recordReceptionRepository.GetQueryableAsync();
            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:CompanyInvalid"]);
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);

            var traceShare = traceRecordShareQuery
                .FirstOrDefault(n => n.StartNumber >= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            if (traceShare == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceCodeInvalid"]);
            }

            var traceRecord = traceRecordQuery.FirstOrDefault(n => n.Id == traceShare.TraceabilityRecordId);
            if (traceRecord == null)
            {
                throw new UserFriendlyException(L["TraceCode:Error:TraceRecordInvalid"]);
            }

            var query = (from fieldResponse in processFieldResponseQuery
                join stepResponse in processStepResponseQuery on fieldResponse.ProcessStepResponseId equals stepResponse
                    .Id
                join step in processStepQuery on stepResponse.ProcessStepId equals step.Id
                join field in processFieldQuery on fieldResponse.ProcessFieldId equals field.Id
                join fieldOption in processFieldOptionQuery on fieldResponse.ProcessFieldOptionId equals fieldOption.Id
                where stepResponse.TraceabilityRecordId == traceRecord.Id
                      && fieldResponse.Selected == true
                select new
                {
                    StepResponseId = stepResponse.Id,
                    stepResponse.ProcessStepId,
                    stepResponse.EntityTypeId,
                    stepResponse.EntityValue,
                    stepResponse.IsDone,
                    stepResponse.CreationTime,
                    StepName = step.Name,
                    StepId = step.Id,
                    FieldName = field.Name,
                    fieldResponse.ResponseText,
                    fieldResponse.Selected,
                    fieldResponse.ExecutorId,
                    step.IsSpecial,
                    FieldId = field.Id,
                    field.DataType,
                    fieldOption.OptionValue
                }).OrderBy(n => n.IsSpecial).ToList();

            var queryGroup = query.GroupBy(n => n.StepId).ToList();
            foreach (var group in queryGroup)
            {
                var stepResponseGroup = group.GroupBy(n => new
                {
                    n.EntityTypeId,
                    n.EntityValue
                }).ToList();
                foreach (var stepGroup in stepResponseGroup)
                {
                    var stepResponse = stepGroup.FirstOrDefault();
                    var step = group.FirstOrDefault();
                    var stepObj = processStepQuery.FirstOrDefault(n => n.Id == stepResponse.ProcessStepId);
                    if (stepObj == null)
                    {
                        throw new UserFriendlyException(L["Step:Error:NotExists"]);
                    }

                    var stepReport = new DiaryReportStepDto
                    {
                        StepName = step!.StepName,
                        RecordDate = stepResponse!.CreationTime,
                        FieldRecords = new List<FieldRecordReportDto>()
                    };
                    var fieldGroup = group.GroupBy(n => n.FieldId).ToList();
                    foreach (var field in fieldGroup)
                    {
                        var fieldObj = field.FirstOrDefault(n => n.Selected == true);
                        if (fieldObj == null)
                        {
                            continue;
                        }

                        var fieldReport = new FieldRecordReportDto
                        {
                            FieldName = fieldObj.FieldName,
                            DataType = fieldObj.DataType,
                            ResponseText = field.FirstOrDefault()?.ResponseText
                        };
                        if (fieldObj.DataType <= (int)ProcessDataTypeEnum.MultiDropdown)
                        {
                            fieldReport.ResponseText = string.Join(", ",
                                field.Where(n => n.Selected == true).Select(n => n.OptionValue).ToList());
                        }

                        stepReport.FieldRecords.Add(fieldReport);
                    }

                    result.Steps.Add(stepReport);
                }
            }
        }

        return result;
    }

    #endregion
}