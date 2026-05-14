using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stamps;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecords;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

// [Authorize(TraceFarmPermissions.TraceabilityRecords.Default)]
public class TraceabilityRecordV2AppService(
    IRepository<ProcessStep, Guid> processStepRepository,
    IRepository<IdentityUser, Guid> userRepository,
    IRepository<Product, Guid> productRepository,
    IRepository<ProcessField, Guid> processFieldRepository,
    IRepository<ProcessFieldOption, Guid> processFieldOptionRepository,
    IRepository<LocationDistrict, Guid> districtRepository,
    IDataFilter dataFilter,
    IRepository<Company, Guid> companyRepository,
    IRepository<Process, Guid> processRepository,
    IRepository<EnumTranslation, Guid> enumTranslationRepository,
    IRepository<StepRecord, Guid> stepRecordRepository,
    IRepository<EntityStepRecord, Guid> entityStepRecordRepository,
    IRepository<RecordReceptionV2, Guid> recordReceptionV2Repository,
    IRepository<RecordShare, Guid> recordShareRepository,
    IRepository<FieldRecord, Guid> fieldRecordRepository,
    IRepository<Supplier, Guid> supplierRepository,
    IRepository<Receptacle, Guid> receptacleRepository,
    IRepository<Partner, Guid> partnerRepository,
    IRepository<CompanyProfile, Guid> companyProfileRepository,
    IConfiguration configuration,
    IRepository<ProcessStepUser, Guid> processStepUserRepository)
    : ApplicationService,
        ITraceabilityRecordV2AppService
{
    public async Task<ListResultDto<DropdownForStepDto>> GetStepDropdownAsync(Guid processId)
    {
        var stepUserQuery = await processStepUserRepository.GetQueryableAsync();
        var stepQuery = await processStepRepository.GetQueryableAsync();
        var currentRole = CurrentUser.Roles.Any(n => n is "admin" or "superAdmin");
        var stepByUser = stepUserQuery.WhereIf(!currentRole, n => n.UserId == CurrentUser.Id)
            .GroupBy(p => p.ProcessStepId)
            .Select(n => n.Key).ToList();
        var query = stepQuery
            .Where(x => x.ProcessId == processId && stepByUser.Contains(x.Id))
            .OrderBy(n => n.Position)
            .Select(x => new DropdownForStepDto
            {
                Id = x.Id,
                Name = x.Name,
                IsSpecial = x.IsSpecial,
                TabIndex = x.Position
            }).ToList();
        return new ListResultDto<DropdownForStepDto>(query);
    }

    public async Task<ListResultDto<RecordReceptionV2Dto>> GetReceptionAsync(Guid stepRecordId)
    {
        if (stepRecordId == Guid.Empty)
        {
            return new ListResultDto<RecordReceptionV2Dto>();
        }

        var query = (await recordReceptionV2Repository.GetQueryableAsync())
            .Where(n =>
                n.StepRecordId == stepRecordId)
            .Select(n => new RecordReceptionV2Dto
            {
                Id = n.Id,
                ReceptionType = n.ReceptionType,
                RecordSharedId = n.RecordSharedId,
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
                    var districtObj = await districtRepository.GetAsync(item.DistrictId.Value);
                    item.DisplayCode = districtObj.OriginalName;
                    break;
                }
                case { ReceptionType: (int)RecordReceptionEnum.Replication, RecordSharedId: not null }:
                {
                    var traceRecordShareObj =
                        await recordShareRepository.GetAsync(item.RecordSharedId.Value);
                    item.DisplayCode = traceRecordShareObj.TraceabilityCode;
                    break;
                }
            }
        }

        return new ListResultDto<RecordReceptionV2Dto>(query);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetReceptionDropdownAsync(Guid processStepId,
        Guid? stepRecordId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyProfile = await companyProfileRepository.GetQueryableAsync();
            var recordReceptionQuery = await recordReceptionV2Repository.GetQueryableAsync();
            var receptionUsed = recordReceptionQuery
                .Where(n => n.ReceptionType == (int)RecordReceptionEnum.Replication && n.StepRecordId != stepRecordId)
                .Select(n => n.RecordSharedId).ToList();

            var query =
                (from recordShare in (await recordShareRepository.GetQueryableAsync()).OrderBy(n => n.CreationTime)
                    join company in companyProfile on recordShare.CompanyProfileId equals company.Id
                    where recordShare.SharedTenantId == CurrentTenant.Id && !receptionUsed.Contains(recordShare.Id)
                    select new DropdownItemBaseDto
                    {
                        Id = recordShare.Id,
                        Name =
                            $"{recordShare.TraceabilityCode}-{company.CompanyName}-{recordShare.CreationTime:dd/MM/yyyy HH:mm}"
                    }).ToList();

            return new ListResultDto<DropdownItemBaseDto>(query);
        }
    }
    
    public async Task<ListResultDto<DropdownItemForMobileDto>> GetReceptionDropdownForMobileAsync(Guid processStepId,
        Guid? stepRecordId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyProfile = await companyProfileRepository.GetQueryableAsync();
            var recordReceptionQuery = await recordReceptionV2Repository.GetQueryableAsync();
            var receptionUsed = recordReceptionQuery
                .Where(n => n.ReceptionType == (int)RecordReceptionEnum.Replication && n.StepRecordId != stepRecordId)
                .Select(n => n.RecordSharedId).ToList();

            var query =
                (from recordShare in (await recordShareRepository.GetQueryableAsync()).OrderBy(n => n.CreationTime)
                    join company in companyProfile on recordShare.CompanyProfileId equals company.Id
                    where recordShare.SharedTenantId == CurrentTenant.Id && !receptionUsed.Contains(recordShare.Id)
                    select new DropdownItemForMobileDto
                    {
                        Id = recordShare.Id,
                        Name =
                            $"{recordShare.TraceabilityCode}-{company.CompanyName}-{recordShare.CreationTime:dd/MM/yyyy HH:mm}",
                        Code = recordShare.TraceabilityCode
                    }).ToList();

            return new ListResultDto<DropdownItemForMobileDto>(query);
        }
    }

    public async Task<ListResultDto<RecordShareDto>> GetRecordShareAsync(Guid stepRecordId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var userQuery = await userRepository.GetQueryableAsync();
            var productQuery = await productRepository.GetQueryableAsync();
            var profileQuery = await companyProfileRepository.GetQueryableAsync();
            var entityStepRecordQuery = await entityStepRecordRepository.GetQueryableAsync();
            var stepReportQuery = await stepRecordRepository.GetQueryableAsync();
            var query = (from recordShare in await recordShareRepository.GetQueryableAsync()
                join user in userQuery on recordShare.CreatorId equals user.Id
                    into userJoin
                from user in userJoin.DefaultIfEmpty()
                join product in productQuery on recordShare.ProductId equals product.Id
                    into productJoin
                from product in productJoin.DefaultIfEmpty()
                join profile in profileQuery on recordShare.CompanyProfileId equals profile.Id into profileJoin
                from profile in profileJoin.DefaultIfEmpty()
                where recordShare.StepRecordId == stepRecordId
                select new RecordShareDto
                {
                    Id = recordShare.Id,
                    TraceabilityCode = recordShare.TraceabilityCode,
                    ProductName = product.ProductName,
                    ProfileName = profile.Name,
                    CreatedBy = user.Name + " (" + recordShare.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    LotId = recordShare.LotId,
                    StepRecordCodeUsed = (from entity in entityStepRecordQuery
                        join record in stepReportQuery on entity.StepRecordId equals record.Id
                        where entity.EntityValue == recordShare.Id
                              && entity.EntityTypeId == (int)EntityTypeEnum.ShareWithPartner
                        select new DropdownItemBaseDto
                        {
                            Name = record.Code,
                            Id = record.Id
                        }).ToList()
                }).ToList();


            return new ListResultDto<RecordShareDto>(query);
        }
    }

    public async Task<CreateUpdateRecordShareDto> GetRecordShareDetailAsync(Guid recordShareId)
    {
        var result = new CreateUpdateRecordShareDto();
        var stepReportQuery = await stepRecordRepository.GetQueryableAsync();
        var entityStepRecordQuery = await entityStepRecordRepository.GetListAsync(n =>
            n.EntityValue == recordShareId && n.EntityTypeId == (int)EntityTypeEnum.ShareWithPartner);
        var recordShare = await recordShareRepository.FirstOrDefaultAsync(n => n.Id == recordShareId);
        return recordShare == null
            ? result
            : new CreateUpdateRecordShareDto
            {
                Id = recordShare.Id,
                ProductId = recordShare.ProductId,
                CompanyProfileId = recordShare.CompanyProfileId,
                PartnerId = recordShare.PartnerId,
                NumberOfStamp = recordShare.NumberOfStamp,
                StartNumber = recordShare.StartNumber,
                EndNumber = recordShare.EndNumber,
                LotId = recordShare.LotId,
                // UseAll = entityStepRecordQuery.Any()
                //     ? entityStepRecordQuery.First().UseAll
                //     : (int)StepRecordUseAllEnum.All,
                RecordCodeIds = entityStepRecordQuery.Select(n => n.StepRecordId).ToList(),
                RecordCodeSelected = (from entity in entityStepRecordQuery
                    join record in stepReportQuery on entity.StepRecordId equals record.Id
                    select new RecordCodeSelectedDto
                    {
                        Name = record.Code,
                        RecordCodeId = record.Id,
                        UseAll = entity.UseAll == (int)StepRecordUseAllEnum.All
                    }).ToList()
            };
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Delete)]
    public async Task<bool> DeleteReceptionAsync(Guid id)
    {
        var receptionRecord = await recordReceptionV2Repository.GetAsync(id);
        if (receptionRecord == null)
        {
            throw new UserFriendlyException(L["RecordReception:Error:NotExists"]);
        }

        var fieldRecordQuery = await fieldRecordRepository.GetListAsync(n =>
            n.StepRecordId == receptionRecord.StepRecordId && n.EntityId == id &&
            n.EntityType == (int)EntityTypeEnum.Reception);
        if (fieldRecordQuery.Any())
        {
            await fieldRecordRepository.DeleteManyAsync(fieldRecordQuery);
        }

        await recordReceptionV2Repository.DeleteAsync(id);
        return true;
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Delete)]
    public async Task<bool> DeleteStepRecordAsync(Guid id)
    {
        await stepRecordRepository.DeleteAsync(id);
        var receptionRecordQuery = await recordReceptionV2Repository.GetListAsync(n => n.StepRecordId == id);
        if (receptionRecordQuery.Any())
        {
            await recordReceptionV2Repository.DeleteManyAsync(receptionRecordQuery);
        }

        var entityStepRecordQuery = await entityStepRecordRepository.GetListAsync(n =>
            n.StepRecordId == id && n.EntityTypeId == (int)EntityTypeEnum.StepRecord);
        if (entityStepRecordQuery.Any())
        {
            await entityStepRecordRepository.DeleteManyAsync(entityStepRecordQuery);
        }

        var fieldRecordQuery = await fieldRecordRepository.GetListAsync(n => n.StepRecordId == id);
        if (fieldRecordQuery.Any())
        {
            await fieldRecordRepository.DeleteManyAsync(fieldRecordQuery);
        }

        var recordShareQuery = await recordShareRepository.GetListAsync(n => n.StepRecordId == id);
        if (recordShareQuery.Any())
        {
            await recordShareRepository.DeleteManyAsync(recordShareQuery);
        }

        return true;
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Delete)]
    public async Task<bool> DeleteRecordShareAsync(Guid id)
    {
        var recordShare = await recordShareRepository.GetAsync(id);
        if (recordShare == null)
        {
            throw new UserFriendlyException(L["RecordShare:Error:NotExists"]);
        }

        var entityStepRecordQuery = await entityStepRecordRepository.GetListAsync(n =>
            n.EntityValue == id && n.EntityTypeId == (int)EntityTypeEnum.ShareWithPartner);
        if (entityStepRecordQuery.Any())
        {
            await entityStepRecordRepository.DeleteManyAsync(entityStepRecordQuery);
        }

        var stepRecord = await stepRecordRepository.FirstOrDefaultAsync(n => n.Id == recordShare.StepRecordId);
        if (stepRecord == null)
        {
            return true;
        }

        var fileQuery = await fieldRecordRepository.GetListAsync(n =>
            n.StepRecordId == stepRecord.Id && n.EntityId == id &&
            n.EntityType == (int)EntityTypeEnum.ShareWithPartner);
        if (fileQuery.Any())
        {
            await fieldRecordRepository.DeleteManyAsync(fileQuery);
        }

        await recordShareRepository.DeleteAsync(id);

        return true;
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Edit)]
    public async Task<bool> SetStepRecordDoneAsync(Guid id)
    {
        var stepRecord = await stepRecordRepository.GetAsync(id);
        if (stepRecord == null)
        {
            throw new UserFriendlyException(L["StepRecord:Error:NotExists"]);
        }

        stepRecord.RecordStatus = (int)StepReportStatusEnum.Done;
        await stepRecordRepository.UpdateAsync(stepRecord);
        var recordShares = await recordShareRepository.GetListAsync(n => n.StepRecordId == id);
        if (recordShares.Count == 0)
        {
            return true;
        }
        foreach (var item in recordShares)
        {
            item.Status = (int)RecordShareStatusEnum.Done;
        }

        await recordShareRepository.UpdateManyAsync(recordShares);

        // todo: check If is last step record then create a share record

        return true;
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Edit)]
    public async Task<bool> SetStepRecordingAsync(Guid id)
    {
        var stepRecord = await stepRecordRepository.GetAsync(id);
        if (stepRecord == null)
        {
            throw new UserFriendlyException(L["StepRecord:Error:NotExists"]);
        }

        stepRecord.RecordStatus = (int)StepReportStatusEnum.Recording;
        await stepRecordRepository.UpdateAsync(stepRecord);

        return true;
    }

    [Authorize(TraceFarmPermissions.TraceabilityRecords.Edit)]
    public async Task<bool> SetStepRecordingByRecordShareAsync(Guid recordShareId)
    {
        var recordShare = await recordShareRepository.GetAsync(recordShareId);
        if (recordShare == null)
        {
            return false;
        }

        recordShare.Status = (int)RecordShareStatusEnum.Recording;
        await recordShareRepository.UpdateAsync(recordShare);

        var stepRecord = await stepRecordRepository.GetAsync(recordShare.StepRecordId);
        if (stepRecord == null)
        {
            throw new UserFriendlyException(L["StepRecord:Error:NotExists"]);
        }

        stepRecord.RecordStatus = (int)StepReportStatusEnum.Recording;
        await stepRecordRepository.UpdateAsync(stepRecord);

        return true;
    }

    public async Task<PagedResultDto<ProcessRecordOutputDto>> GetProcessRecordAsync(ProcessRecordFilterDto input)
    {
        var processQuery = await processRepository.GetQueryableAsync();
        var processStepQuery = await processStepRepository.GetQueryableAsync();
        var userQuery = await userRepository.GetQueryableAsync();

        if (input.CreationDateEnd.HasValue)
        {
            input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
        }

        var processFilter = processQuery
            .WhereIf(input.ProcessIds != null && input.ProcessIds.Any(),
                n => input.ProcessIds != null && input.ProcessIds.Contains(n.Id))
            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                n => input.Filter != null && n.Name.ToLower().Contains(input.Filter.ToLower()))
            .WhereIf(input.CreatedBy != null && input.CreatedBy.Any(),
                n => input.CreatedBy != null && input.CreatedBy.Contains(n.CreatorId!.Value))
            .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
            .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);
        var joinQuery = from process in processFilter
            join user in userQuery on process.CreatorId equals user.Id
            select new ProcessRecordOutputDto
            {
                Name = process.Name,
                StepCount = processStepQuery.Count(x => x.ProcessId == process.Id),
                CreatedBy = user.Name + " (" + process.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                ProcessId = process.Id
            };
        var result = joinQuery
            .OrderBy(input.Sorting ?? "Name")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<ProcessRecordOutputDto>(processFilter.Count(), result);
    }

    public async Task<ListResultDto<EnumItemBaseDto>> GetStepReportStatus()
    {
        var cultureInfo = CultureInfo.CurrentUICulture;
        var query = (await enumTranslationRepository.GetQueryableAsync())
            .Where(x => x.EnumType == nameof(StepReportStatusEnum) && x.Language == cultureInfo.Name)
            .Select(x => new EnumItemBaseDto
            {
                Id = x.EnumKey,
                Name = x.EnumValue
            }).ToList();
        return new ListResultDto<EnumItemBaseDto>(query);
    }

    public async Task<ListResultDto<ProcessFieldResponseDto>> GetStepResponse(Guid stepId, Guid? stepRecordId,
        Guid? entityValue)
    {
        List<ProcessFieldResponseDto> result;
        var processFieldQuery = await processFieldRepository.GetQueryableAsync();
        var processFieldOptionQuery = await processFieldOptionRepository.GetQueryableAsync();
        var stepObj = await processStepRepository.FirstOrDefaultAsync(n => n.Id == stepId);
        if (stepObj == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        if (stepRecordId == null || stepRecordId == Guid.Empty)
        {
            result = processFieldQuery.Where(n => n.StepId == stepId && !n.IsDeleted)
                .Select(n => new ProcessFieldResponseDto
                {
                    Id = n.Id,
                    ProcessFieldId = n.Id,
                    Name = n.Name,
                    DataType = n.DataType,
                    IsObligatory = n.IsObligatory,
                    Position = n.Position,
                    Options = processFieldOptionQuery.Where(x => x.ProcessFieldId == n.Id && !n.IsDeleted)
                        .Select(x => new ProcessFieldOptionResponseDto
                                {
                                    Name = x.OptionValue,
                                    Id = x.Id,
                                    Selected = false,
                                    ResponseText = "",
                                    ProcessFieldOptionId = x.Id
                                }).ToList()
                }).ToList();
        }
        else
        {
            result = (await fieldRecordRepository.GetListAsync(n =>
                n.StepRecordId == stepRecordId && n.EntityId == entityValue)).GroupBy(n => n.ProcessFieldId).Select(n =>
                new ProcessFieldResponseDto
                {
                    Id = n.Key,
                    ProcessFieldId = n.Key,
                    ProcessStepResponseId = stepRecordId.Value,
                    Name = processFieldRepository.GetAsync(n.Key).Result.Name,
                    DataType = processFieldRepository.GetAsync(n.Key).Result.DataType,
                    IsObligatory = processFieldRepository.GetAsync(n.Key).Result.IsObligatory,
                    Position = processFieldRepository.GetAsync(n.Key).Result.Position,
                    ExecutorId = n.FirstOrDefault()!.ExecutorId,
                    Options = n.Select(x => new ProcessFieldOptionResponseDto
                    {
                        Name = processFieldRepository.GetAsync(n.Key).Result.DataType <
                               (int)ProcessDataTypeEnum.Supplier
                            ? processFieldOptionRepository.GetAsync(x.ProcessFieldOptionId).Result.OptionValue
                            : "null",
                        Id = x.Id,
                        Selected = x.Selected ?? false,
                        ResponseText = x.ResponseText,
                        ExecutorId = x.ExecutorId,
                        EntityId = x.EntityId,
                        ProcessFieldOptionId = x.ProcessFieldOptionId
                    }).ToList()
                }).ToList();
        }

        var supplierData = (await supplierRepository.GetQueryableAsync()).Select(n => new
        {
            n.Id,
            n.Name
        }).ToList();
        var receptacleData = (await receptacleRepository.GetQueryableAsync()).OrderByDescending(n=>n.CreationTime).Select(n => new
        {
            n.Id,
            n.Code
        }).ToList();
        var partnerData = (await partnerRepository.GetQueryableAsync()).Select(n => new
        {
            n.Name,
            n.Id
        }).ToList();
        var productData = (await productRepository.GetQueryableAsync()).Select(n => new
        {
            n.Id,
            n.ProductName
        }).ToList();
        var fieldResponses = result.Where(fieldResponse =>
            fieldResponse.DataType is >= (int)ProcessDataTypeEnum.Supplier and <= (int)ProcessDataTypeEnum.Product);
        foreach (var fieldResponse in fieldResponses)
        {
            var selectedOption = fieldResponse.Options.FirstOrDefault(n => n.Selected);
            // Once field with data type is supplier, receptacle, partner, product only have one option
            var fieldResponseOptionId = fieldResponse.Options.FirstOrDefault()?.Id ?? Guid.Empty;
            switch (fieldResponse.DataType)
            {
                case (int)ProcessDataTypeEnum.Supplier:
                    if (selectedOption == null)
                    {
                        fieldResponse.Options = supplierData.Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            ProcessFieldOptionId = n.Id,
                            Name = n.Name,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null
                        }).ToList();
                    }
                    else
                    {
                        var supplier = supplierData.FirstOrDefault(n => n.Id == selectedOption.ProcessFieldOptionId);
                        selectedOption.Name = supplier != null ? supplier.Name : "";
                        fieldResponse.Options.AddRange(supplierData
                            .Where(n => n.Id != selectedOption.ProcessFieldOptionId)
                            .Select(n => new ProcessFieldOptionResponseDto
                            {
                                Id = fieldResponseOptionId,
                                ProcessFieldOptionId = n.Id,
                                Name = n.Name,
                                Selected = false,
                                ResponseText = "",
                                ExecutorId = null
                            }).ToList());
                    }

                    break;
                case (int)ProcessDataTypeEnum.Receptacle:
                    if (selectedOption == null)
                    {
                        fieldResponse.Options = receptacleData.Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            ProcessFieldOptionId = n.Id,
                            Name = n.Code,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null
                        }).ToList();
                    }
                    else
                    {
                        var replication =
                            receptacleData.FirstOrDefault(n => n.Id == selectedOption.ProcessFieldOptionId);
                        selectedOption.Name = replication != null ? replication.Code : "";

                        fieldResponse.Options.AddRange(receptacleData
                        .Where(n => n.Id != selectedOption.ProcessFieldOptionId)
                        .Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            ProcessFieldOptionId = n.Id,
                            Name = n.Code,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null
                        }).ToList());
                    }

                    break;
                case (int)ProcessDataTypeEnum.Partner:
                    if (selectedOption == null)
                    {
                        fieldResponse.Options = partnerData.Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            ProcessFieldOptionId = n.Id,
                            Name = n.Name,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null
                        }).ToList();
                    }
                    else
                    {
                        var partner = partnerData.FirstOrDefault(n => n.Id == selectedOption.ProcessFieldOptionId);
                        selectedOption.Name = partner != null ? partner.Name : "";

                        fieldResponse.Options.AddRange(partnerData
                        .Where(n => n.Id != selectedOption.ProcessFieldOptionId)
                        .Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            ProcessFieldOptionId = n.Id,
                            Name = n.Name,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null
                        }).ToList());
                    }
                    break;
                case (int)ProcessDataTypeEnum.Product:
                    if (selectedOption == null)
                    {
                        fieldResponse.Options = productData.Select(n => new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            Name = n.ProductName,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null,
                            ProcessFieldOptionId = n.Id
                        }).ToList();
                    }
                    else
                    {
                        var product = productData.FirstOrDefault(n => n.Id == selectedOption.ProcessFieldOptionId);
                        selectedOption.Name = product != null ? product.ProductName : "";
                        fieldResponse.Options.AddRange(productData
                        .Where(n => n.Id != selectedOption.ProcessFieldOptionId).Select(n =>
                        new ProcessFieldOptionResponseDto
                        {
                            Id = fieldResponseOptionId,
                            Name = n.ProductName,
                            Selected = false,
                            ResponseText = "",
                            ExecutorId = null,
                            ProcessFieldOptionId = n.Id
                        }).ToList());
                    }
                    break;
            }
        }

        return new ListResultDto<ProcessFieldResponseDto>(result.OrderBy(n => n.Position).ToList());
    }

    #region Save record
    public async Task<Guid> SaveRecordResponseAsync(CreateUpdateStepReportFirstDto input)
    {
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var recordReceptionQuery = await recordReceptionV2Repository.GetQueryableAsync();
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processStep == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        var stepRecord = stepRecordQuery.FirstOrDefault(n => n.Id == input.StepReportId);
        if (stepRecord == null)
        {
            string stepRecordCode;
            using (dataFilter.Disable<ISoftDelete>())
            {
                var stepRecordCount =
                    (await stepRecordRepository.GetQueryableAsync()).Count(n =>
                        n.ProcessStepId == input.ProcessStepId) + 1;
                stepRecordCode = processStep.Position.ToString("D6") + "." + stepRecordCount;
            }

            stepRecord = new StepRecord
            {
                RecordStatus =
                    input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording,
                ProcessStepId = input.ProcessStepId,
                Code = stepRecordCode,
                UseAll = (int)StepRecordUseAllEnum.NotUseAll
            };
            await stepRecordRepository.InsertAsync(stepRecord, true);
        }
        else
        {
            stepRecord.RecordStatus =
                input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording;
            await stepRecordRepository.UpdateAsync(stepRecord, true);
        }

        var recordReception = recordReceptionQuery.FirstOrDefault(n => n.Id == input.Reception.Id);
        if (recordReception == null)
        {
            recordReception = new RecordReceptionV2
            {
                ReceptionType = input.Reception.ReceptionType,
                RecordSharedId = input.Reception.RecordSharedId,
                CountryId = input.Reception.CountryId,
                ProvinceId = input.Reception.ProvinceId,
                DistrictId = input.Reception.DistrictId,
                StepRecordId = stepRecord.Id
            };
            await recordReceptionV2Repository.InsertAsync(recordReception, true);
        }
        else
        {
            recordReception.ReceptionType = input.Reception.ReceptionType;
            recordReception.RecordSharedId = input.Reception.RecordSharedId;
            recordReception.CountryId = input.Reception.CountryId;
            recordReception.ProvinceId = input.Reception.ProvinceId;
            recordReception.DistrictId = input.Reception.DistrictId;
            await recordReceptionV2Repository.UpdateAsync(recordReception, true);
        }

        var listFieldResponseCreate = new List<FieldRecord>();
        var listFieldResponseUpdate = new List<FieldRecord>();
        foreach (var fieldResponse in input.FieldRecords)
        {
            if (fieldResponse.DataType is >= (int)ProcessDataTypeEnum.Supplier and <= (int)ProcessDataTypeEnum.Product)
            {
                fieldResponse.Options = fieldResponse.Options.Where(n => n.Selected).ToList();
            }

            foreach (var option in fieldResponse.Options)
            {
                var fieldRecord =
                    await fieldRecordRepository.FirstOrDefaultAsync(n => n.Id == option.Id);
                if (fieldRecord == null)
                {
                    listFieldResponseCreate.Add(new FieldRecord
                    {
                        ProcessFieldId = fieldResponse.ProcessFieldId,
                        ResponseText = option.ResponseText??"",
                        StepRecordId = stepRecord.Id,
                        ProcessFieldOptionId = option.ProcessFieldOptionId,
                        Selected = option.Selected,
                        ExecutorId = fieldResponse.ExecutorId == Guid.Empty ? CurrentUser.Id : fieldResponse.ExecutorId,
                        EntityId = recordReception.Id,
                        EntityType = (int)EntityTypeEnum.Reception
                    });
                }
                else
                {
                    fieldRecord.ResponseText = option.ResponseText??"";
                    fieldRecord.Selected = option.Selected;
                    fieldRecord.ProcessFieldOptionId = option.ProcessFieldOptionId;
                    fieldRecord.ExecutorId = fieldResponse.ExecutorId == Guid.Empty
                        ? CurrentUser.Id
                        : fieldResponse.ExecutorId;
                    listFieldResponseUpdate.Add(fieldRecord);
                }
            }
        }

        if (listFieldResponseCreate.Count > 0)
        {
            await fieldRecordRepository.InsertManyAsync(listFieldResponseCreate);
        }

        if (listFieldResponseUpdate.Count > 0)
        {
            await fieldRecordRepository.UpdateManyAsync(listFieldResponseUpdate);
        }

        return stepRecord.Id;
    }

    public async Task<List<Guid>> SaveListRecordResponseAsync(List<CreateUpdateStepReportFirstDto> input)
    {
        var result = new List<Guid>();
        foreach (var item in input)
        {
            result.Add(await SaveRecordResponseAsync(item));
        }
        
        return result;
    }
    public async Task<Guid> SaveRecordResponseNormalAsync(CreateUpdateStepReportNormalDto input)
    {
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processStep == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        var stepRecord = stepRecordQuery.FirstOrDefault(n => n.Id == input.StepReportId);
        if (stepRecord == null)
        {
            var stepRecordCount =
                (await stepRecordRepository.GetQueryableAsync()).Count(n => n.ProcessStepId == input.ProcessStepId) +
                1;
            var stepRecordCode = processStep.Position.ToString("D6") + "." + stepRecordCount;
            stepRecord = new StepRecord
            {
                RecordStatus =
                    input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording,
                ProcessStepId = input.ProcessStepId,
                Code = stepRecordCode,
                UseAll = (int)StepRecordUseAllEnum.NotUseAll
            };
            await stepRecordRepository.InsertAsync(stepRecord, true);
        }
        else
        {
            stepRecord.RecordStatus =
                input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording;
            await stepRecordRepository.UpdateAsync(stepRecord, true);

            var entityStepRecords = await entityStepRecordRepository.GetListAsync(n => n.EntityValue == stepRecord.Id);
            if (entityStepRecords.Any())
            {
                await entityStepRecordRepository.HardDeleteAsync(entityStepRecords);
            }
        }

        if (input.RecordCodeSelected != null)
        {
            var entityInput = input.RecordCodeSelected.Select(recordCode => new EntityStepRecord
            {
                EntityValue = stepRecord.Id,
                EntityTypeId = (int)EntityTypeEnum.StepRecord,
                StepRecordId = recordCode.RecordCodeId,
                UseAll = recordCode.UseAll ? (int)StepRecordUseAllEnum.All : (int)StepRecordUseAllEnum.NotUseAll
            }).ToList();
            await entityStepRecordRepository.InsertManyAsync(entityInput);
       
            foreach (var recordCode in input.RecordCodeSelected)
            {
                var stepRecordObj =
                    await stepRecordRepository.FirstOrDefaultAsync(n => n.Id == recordCode.RecordCodeId);
                if (stepRecordObj == null)
                {
                    continue;
                }

                var userAll = recordCode.UseAll ? (int)StepRecordUseAllEnum.All : (int)StepRecordUseAllEnum.NotUseAll;
                stepRecordObj.RecordStatus = userAll == (int)StepRecordUseAllEnum.All
                    ? (int)StepReportStatusEnum.Sold
                    : (int)StepReportStatusEnum.Done;
                stepRecordObj.UseAll =
                    recordCode.UseAll ? (int)StepRecordUseAllEnum.All : (int)StepRecordUseAllEnum.NotUseAll;
                await stepRecordRepository.UpdateAsync(stepRecordObj);
            }
        }

        var listFieldResponseCreate = new List<FieldRecord>();
        var listFieldResponseUpdate = new List<FieldRecord>();
        foreach (var fieldResponse in input.FieldRecords)
        {
            if (fieldResponse.DataType is >= (int)ProcessDataTypeEnum.Supplier and <= (int)ProcessDataTypeEnum.Product)
            {
                fieldResponse.Options = fieldResponse.Options.Where(n => n.Selected).ToList();
            }

            foreach (var option in fieldResponse.Options)
            {
                var fieldRecord =
                    await fieldRecordRepository.FirstOrDefaultAsync(n => n.Id == option.Id);
                if (fieldRecord == null)
                {
                    listFieldResponseCreate.Add(new FieldRecord
                    {
                        ProcessFieldId = fieldResponse.ProcessFieldId,
                        ResponseText = option.ResponseText??"",
                        StepRecordId = stepRecord.Id,
                        ProcessFieldOptionId = option.ProcessFieldOptionId, // todo: check this
                        Selected = option.Selected,
                        ExecutorId = fieldResponse.ExecutorId == Guid.Empty ? CurrentUser.Id : fieldResponse.ExecutorId,
                        EntityId = Guid.Empty,
                        EntityType = (int)EntityTypeEnum.StepRecord
                    });
                }
                else
                {
                    fieldRecord.ResponseText = option.ResponseText??"";
                    fieldRecord.Selected = option.Selected;
                    fieldRecord.ProcessFieldOptionId = option.ProcessFieldOptionId; // todo: check this
                    fieldRecord.ExecutorId = fieldResponse.ExecutorId == Guid.Empty
                        ? CurrentUser.Id
                        : fieldResponse.ExecutorId; // todo: check this
                    listFieldResponseUpdate.Add(fieldRecord);
                }
            }
        }

        if (listFieldResponseCreate.Count > 0)
        {
            await fieldRecordRepository.InsertManyAsync(listFieldResponseCreate);
        }

        if (listFieldResponseUpdate.Count > 0)
        {
            await fieldRecordRepository.UpdateManyAsync(listFieldResponseUpdate);
        }

        return stepRecord.Id;
    }

    public async Task<List<Guid>> SaveListRecordResponseNormalAsync(List<CreateUpdateStepReportNormalDto> input)
    {
        var result = new List<Guid>();
        foreach (var item in input)
        {
            result.Add(await SaveRecordResponseNormalAsync(item));
        }
        
        return result;
    }
    public async Task<Guid> SaveRecordResponseLastAsync(CreateUpdateStepReportLastDto input)
    {
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processStep == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        var stepRecord = stepRecordQuery.FirstOrDefault(n => n.Id == input.StepReportId);
        if (stepRecord == null)
        {
            string stepRecordCode;
            using (dataFilter.Disable<ISoftDelete>())
            {
                var stepRecordCount =
                    (await stepRecordRepository.GetQueryableAsync()).Count(n =>
                        n.ProcessStepId == input.ProcessStepId) + 1;
                stepRecordCode = processStep.Position.ToString("D6") + "." + stepRecordCount;
            }

            stepRecord = new StepRecord
            {
                RecordStatus =
                    input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording,
                ProcessStepId = input.ProcessStepId,
                Code = stepRecordCode,
                UseAll = (int)StepRecordUseAllEnum.NotUseAll
            };
            await stepRecordRepository.InsertAsync(stepRecord, true);
        }
        else
        {
            stepRecord.RecordStatus =
                input.RecordStatus ? (int)StepReportStatusEnum.Done : (int)StepReportStatusEnum.Recording;
            await stepRecordRepository.UpdateAsync(stepRecord, true);
        }

        var traceabilityCode = "";
        var company = await companyRepository.FirstOrDefaultAsync(n => n.TenantId == CurrentTenant.Id);
        if (company != null)
        {
            var startNumber = input.RecordShare.StartNumber.ToString("D6");
            traceabilityCode = $"{company.GS1Code}{startNumber}";
        }

        var shareTenantId = Guid.Empty;
        if (input.RecordShare.PartnerId != Guid.Empty)
        {
            var partnerData = await partnerRepository.FirstOrDefaultAsync(n => n.Id == input.RecordShare.PartnerId);
            if (partnerData is { CompanyId: not null } && partnerData.CompanyId != Guid.Empty)
            {
                using (dataFilter.Disable<IMultiTenant>())
                {
                    var partnerCompany =
                        await companyRepository.FirstOrDefaultAsync(n => n.Id == partnerData.CompanyId);
                    if (partnerCompany != null)
                    {
                        shareTenantId = partnerCompany.TenantId;
                    }
                }
            }
        }
        
        var shareRecord = await recordShareRepository.FirstOrDefaultAsync(n => n.Id == input.RecordShare.Id);
        if (shareRecord == null)
        {
            shareRecord = new RecordShare
            {
                TraceabilityCode = traceabilityCode, // this field will be update later
                StepRecordId = stepRecord.Id,
                SharedTenantId = shareTenantId,
                PartnerId = input.RecordShare.PartnerId,
                ProductId = input.RecordShare.ProductId,
                CompanyProfileId = input.RecordShare.CompanyProfileId,
                NumberOfStamp = input.RecordShare.NumberOfStamp,
                StartNumber = input.RecordShare.StartNumber,
                EndNumber = input.RecordShare.EndNumber,
                LotId = input.RecordShare.LotId,
                SourceTenantId = CurrentTenant.Id,
                Status = stepRecord.RecordStatus,
            };
            await recordShareRepository.InsertAsync(shareRecord, true);
        }
        else
        {
            shareRecord.TraceabilityCode = traceabilityCode; // this field will be update later
            shareRecord.StepRecordId = stepRecord.Id;
            shareRecord.SharedTenantId = shareTenantId;
            shareRecord.PartnerId = input.RecordShare.PartnerId;
            shareRecord.ProductId = input.RecordShare.ProductId;
            shareRecord.CompanyProfileId = input.RecordShare.CompanyProfileId;
            shareRecord.NumberOfStamp = input.RecordShare.NumberOfStamp;
            shareRecord.StartNumber = input.RecordShare.StartNumber;
            shareRecord.EndNumber = input.RecordShare.EndNumber;
            shareRecord.LotId = input.RecordShare.LotId;
            shareRecord.Status = stepRecord.RecordStatus;

            await recordShareRepository.UpdateAsync(shareRecord, true);
            var entityStepRecords =
                await entityStepRecordRepository.GetListAsync(n => n.EntityValue == shareRecord.Id);
            if (entityStepRecords.Any())
            {
                await entityStepRecordRepository.HardDeleteAsync(entityStepRecords);
            }
        }

        var entityInput = input.RecordShare.RecordCodeSelected.Select(recordCode => new EntityStepRecord
        {
            EntityValue = shareRecord.Id,
            EntityTypeId = (int)EntityTypeEnum.ShareWithPartner,
            StepRecordId = recordCode.RecordCodeId,
            UseAll = recordCode.UseAll ? (int)StepRecordUseAllEnum.All : (int)StepRecordUseAllEnum.NotUseAll
        }).ToList();
        await entityStepRecordRepository.InsertManyAsync(entityInput);

        foreach (var recordCode in input.RecordShare.RecordCodeSelected)
        {
            var stepRecordObj = await stepRecordRepository.FirstOrDefaultAsync(n => n.Id == recordCode.RecordCodeId);
            if (stepRecordObj == null)
            {
                continue;
            }

            var userAll = recordCode.UseAll ? (int)StepRecordUseAllEnum.All : (int)StepRecordUseAllEnum.NotUseAll;
            stepRecordObj.RecordStatus = userAll == (int)StepRecordUseAllEnum.All
                ? (int)StepReportStatusEnum.Sold
                : (int)StepReportStatusEnum.Done;
            stepRecordObj.UseAll = userAll;
            await stepRecordRepository.UpdateAsync(stepRecordObj);
        }

        // foreach (var entityStepRecord in input.RecordCodeIds.Select(recordCode => new EntityStepRecord
        //          {
        //              EntityValue = shareRecord.Id,
        //              EntityTypeId = (int)EntityTypeEnum.ShareWithPartner,
        //              StepRecordId = recordCode
        //          }))
        // {
        //     await _entityStepRecordRepository.InsertAsync(entityStepRecord);
        // }

        var listFieldResponseCreate = new List<FieldRecord>();
        var listFieldResponseUpdate = new List<FieldRecord>();
        foreach (var fieldResponse in input.FieldRecords)
        {   
            if (fieldResponse.DataType is >= (int)ProcessDataTypeEnum.Supplier and <= (int)ProcessDataTypeEnum.Product)
            {
                fieldResponse.Options = fieldResponse.Options.Where(n => n.Selected).ToList();
            }

            foreach (var option in fieldResponse.Options)
            {
                var fieldRecord =
                    await fieldRecordRepository.FirstOrDefaultAsync(n => n.Id == option.Id);
                if (fieldRecord == null)
                {
                    listFieldResponseCreate.Add(new FieldRecord
                    {
                        ProcessFieldId = fieldResponse.ProcessFieldId,
                        ResponseText = option.ResponseText??"",
                        StepRecordId = stepRecord.Id,
                        ProcessFieldOptionId = option.ProcessFieldOptionId,
                        Selected = option.Selected,
                        ExecutorId = fieldResponse.ExecutorId == Guid.Empty ? CurrentUser.Id : fieldResponse.ExecutorId,
                        EntityId = shareRecord.Id,
                        EntityType = (int)EntityTypeEnum.ShareWithPartner
                    });
                }
                else
                {
                    fieldRecord.ResponseText = option.ResponseText??"";
                    fieldRecord.Selected = option.Selected;
                    fieldRecord.ProcessFieldOptionId = option.ProcessFieldOptionId;
                    fieldRecord.ExecutorId = fieldResponse.ExecutorId == Guid.Empty
                        ? CurrentUser.Id
                        : fieldResponse.ExecutorId;
                    listFieldResponseUpdate.Add(fieldRecord);
                }
            }
        }

        if (listFieldResponseCreate.Count > 0)
        {
            await fieldRecordRepository.InsertManyAsync(listFieldResponseCreate);
        }

        if (listFieldResponseUpdate.Count > 0)
        {
            await fieldRecordRepository.UpdateManyAsync(listFieldResponseUpdate);
        }

        return stepRecord.Id;
    }
    public async Task<List<Guid>> SaveListRecordResponseLastAsync(List<CreateUpdateStepReportLastDto> input)
    {
        var result = new List<Guid>();
        foreach (var item in input)
        {
            var numberOfStamp = await GenerateStampNumberAsync(item.RecordShare.NumberOfStamp);
            item.RecordShare.StartNumber = numberOfStamp.StartNumber;
            item.RecordShare.EndNumber = numberOfStamp.EndNumber;
            result.Add(await SaveRecordResponseLastAsync(item));
        }
        
        return result;
    }
    #endregion

    #region Get data for table

    /// <summary>
    ///     User get first step report
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    public async Task<PagedResultDto<StepReportDto>> GetFirstStepReportAsync(StepReportFilterDto input)
    {
        var stepReportQuery = await stepRecordRepository.GetQueryableAsync();
        var userQuery = await userRepository.GetQueryableAsync();
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processStep == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        if (input.CreationDateEnd.HasValue)
        {
            input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
        }

        var receptionQuery = await recordReceptionV2Repository.GetQueryableAsync();
        var recordShareQuery = await recordShareRepository.GetQueryableAsync();
        var filter = stepReportQuery
            .Where(n => n.ProcessStepId == input.ProcessStepId)
            .WhereIf(input.StepStatus != null && input.StepStatus.Any(),
                n => input.StepStatus != null && input.StepStatus.Contains(n.RecordStatus))
            .WhereIf(input.CreatedBy != null && input.CreatedBy.Any(),
                n => input.CreatedBy != null && input.CreatedBy.Contains(n.CreatorId))
            .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
            .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);
        var query = (from step in filter
                join createdUser in userQuery on step.CreatorId equals createdUser.Id
                    into userJoin
                from createdUser in userJoin.DefaultIfEmpty()
                join updatedUser in userQuery on step.LastModifierId equals updatedUser.Id
                    into updatedUserJoin
                from updatedUser in updatedUserJoin.DefaultIfEmpty()
                select new StepReportDto
                {
                    Id = step.Id,
                    Code = step.Code,
                    RecordStatusEnumValue = step.RecordStatus,
                    ProcessStepId = step.ProcessStepId,
                    IsEditEnabled = step.RecordStatus != (int)StepReportStatusEnum.Recording,
                    CreatedBy = createdUser.Name + " (" + step.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    CreationTime = step.CreationTime,
                    LastModifiedBy = updatedUser != null
                        ? step.LastModificationTime.HasValue
                            ? updatedUser.Name + " (" + step.LastModificationTime.Value.ToString("dd/MM/yyyy HH:mm") +
                              ")"
                            : ""
                        : ""
                }).OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        foreach (var item in query)
        {
            var status = await enumTranslationRepository.FirstOrDefaultAsync(n =>
                n.EnumKey == item.RecordStatusEnumValue
                && n.EnumType == nameof(StepReportStatusEnum)
                && n.Language == CultureInfo.CurrentUICulture.Name
            );
            if (status != null)
            {
                item.RecordStatus = status.EnumValue;
            }

            var receptions = receptionQuery
                .Where(n => n.StepRecordId == item.Id)
                .Select(n => new
                {
                    n.ReceptionType,
                    n.DistrictId,
                    n.RecordSharedId
                })
                .ToList();
            if (!receptions.Any())
            {
                continue;
            }

            item.EntityCodes = new List<string>();
            foreach (var reception in receptions)
            {
                switch (reception.ReceptionType)
                {
                    case (int)EntityTypeEnum.Origin:
                    {
                        if (reception.DistrictId == null)
                        {
                            continue;
                        }

                        var districtObj = await districtRepository.GetAsync(reception.DistrictId.Value);
                        item.EntityCodes.Add(districtObj.OriginalName);

                        break;
                    }
                    case (int)EntityTypeEnum.Reception:
                    {
                        var recordShare = recordShareQuery.FirstOrDefault(n => n.Id == reception.RecordSharedId);
                        if (recordShare != null)
                        {
                            item.EntityCodes.Add(recordShare.TraceabilityCode);
                        }

                        break;
                    }
                }
            }

            if (item.EntityCodes.Any())
            {
                item.ReceptionOrOrigin = string.Join(", ", item.EntityCodes);
            }
        }

        return new PagedResultDto<StepReportDto>(filter.Count(), query);
    }

    public async Task<PagedResultDto<StepReportDto>> GetNormalStepReportAsync(StepReportFilterDto input)
    {
        var stepReportQuery = await stepRecordRepository.GetQueryableAsync();
        var userQuery = await userRepository.GetQueryableAsync();
        var processSte = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processSte == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        if (input.CreationDateEnd.HasValue)
        {
            input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
        }

        var entityStepRecordQuery = await entityStepRecordRepository.GetQueryableAsync();
        var filter = stepReportQuery
            .Where(n => n.ProcessStepId == input.ProcessStepId)
            .WhereIf(input.StepStatus != null && input.StepStatus.Any(),
                n => input.StepStatus != null && input.StepStatus.Contains(n.RecordStatus))
            .WhereIf(input.CreatedBy != null && input.CreatedBy.Any(),
                n => input.CreatedBy != null && input.CreatedBy.Contains(n.CreatorId))
            .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
            .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);

        var query = (from step in filter
                join createdUser in userQuery on step.CreatorId equals createdUser.Id
                    into userJoin
                from createdUser in userJoin.DefaultIfEmpty()
                join updatedUser in userQuery on step.LastModifierId equals updatedUser.Id
                    into updatedUserJoin
                from updatedUser in updatedUserJoin.DefaultIfEmpty()
                select new StepReportDto
                {
                    Id = step.Id,
                    Code = step.Code,
                    RecordStatusEnumValue = step.RecordStatus,
                    ProcessStepId = step.ProcessStepId,
                    UseAll = step.UseAll,
                    CreationTime = step.CreationTime,
                    CreatedBy = createdUser.Name + " (" + step.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    LastModifiedBy = updatedUser != null
                        ? step.LastModificationTime.HasValue
                            ? updatedUser.Name + " (" + step.LastModificationTime.Value.ToString("dd/MM/yyyy HH:mm") +
                              ")"
                            : ""
                        : ""
                }).OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        foreach (var item in query)
        {
            var status = await enumTranslationRepository.FirstOrDefaultAsync(n =>
                n.EnumKey == item.RecordStatusEnumValue
                && n.EnumType == nameof(StepReportStatusEnum)
                && n.Language == CultureInfo.CurrentUICulture.Name
            );
            if (status != null)
            {
                item.RecordStatus = status.EnumValue;
            }

            item.StepRecordCodeUsed = (from entity in entityStepRecordQuery
                join record in stepReportQuery on entity.StepRecordId equals record.Id
                where entity.EntityValue == item.Id
                      && entity.EntityTypeId == (int)EntityTypeEnum.StepRecord
                select new StepRecordDropdownDto
                {
                    Name = record.Code,
                    Id = record.Id,
                    UseAll = entity.UseAll == (int)StepRecordUseAllEnum.All
                }).ToList();
            if (item.StepRecordCodeUsed.Any())
            {
                item.EntityCodeStr = string.Join(", ", item.StepRecordCodeUsed.Select(n => n.Name));
            }
        }

        return new PagedResultDto<StepReportDto>(filter.Count(), query);
    }

    public async Task<PagedResultDto<StepReportDto>> GetLastStepReportAsync(StepReportFilterDto input)
    {
        var stepReportQuery = await stepRecordRepository.GetQueryableAsync();
        var userQuery = await userRepository.GetQueryableAsync();
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == input.ProcessStepId);
        if (processStep == null)
        {
            throw new UserFriendlyException(L["Step:Error:NotExists"]);
        }

        if (input.CreationDateEnd.HasValue)
        {
            input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
        }

        var entityStepRecordQuery = await entityStepRecordRepository.GetQueryableAsync();
        var recordShareQuery = await recordShareRepository.GetQueryableAsync();
        var filter = stepReportQuery
            .Where(n => n.ProcessStepId == input.ProcessStepId && n.RecordStatus == (int)StepReportStatusEnum.Recording)
            .WhereIf(input.StepStatus != null && input.StepStatus.Any(),
                n => input.StepStatus != null && input.StepStatus.Contains(n.RecordStatus))
            .WhereIf(input.CreatedBy != null && input.CreatedBy.Any(),
                n => input.CreatedBy != null && input.CreatedBy.Contains(n.CreatorId))
            .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
            .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);

        var query = (from step in filter
                join createdUser in userQuery on step.CreatorId equals createdUser.Id
                    into userJoin
                from createdUser in userJoin.DefaultIfEmpty()
                join updatedUser in userQuery on step.LastModifierId equals updatedUser.Id
                    into updatedUserJoin
                from updatedUser in updatedUserJoin.DefaultIfEmpty()
                select new StepReportDto
                {
                    Id = step.Id,
                    Code = step.Code,
                    RecordStatusEnumValue = step.RecordStatus,
                    ProcessStepId = step.ProcessStepId,
                    UseAll = step.UseAll,
                    CreationTime = step.CreationTime,
                    CreatedBy = createdUser.Name + " (" + step.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    LastModifiedBy = updatedUser != null
                        ? step.LastModificationTime.HasValue
                            ? updatedUser.Name + " (" + step.LastModificationTime.Value.ToString("dd/MM/yyyy HH:mm") +
                              ")"
                            : ""
                        : ""
                }).OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        foreach (var item in query)
        {
            var recordShares = recordShareQuery
                .Where(n => n.StepRecordId == item.Id)
                .Select(n => n.Id)
                .ToList();
            if (!recordShares.Any())
            {
                continue;
            }

            var status = await enumTranslationRepository.FirstOrDefaultAsync(n =>
                n.EnumKey == item.RecordStatusEnumValue
                && n.EnumType == nameof(StepReportStatusEnum)
                && n.Language == CultureInfo.CurrentUICulture.Name
            );
            if (status != null)
            {
                item.RecordStatus = status.EnumValue;
            }

            item.EntityCodes = new List<string>();
            foreach (var recordShareId in recordShares)
            {
                item.StepRecordCodeUsed = (from entity in entityStepRecordQuery
                    join record in stepReportQuery on entity.StepRecordId equals record.Id
                    where entity.EntityValue == recordShareId
                          && entity.EntityTypeId == (int)EntityTypeEnum.ShareWithPartner
                    select new StepRecordDropdownDto
                    {
                        Name = record.Code,
                        Id = record.Id,
                        UseAll = entity.UseAll == (int)StepRecordUseAllEnum.All
                    }).ToList();
                if (item.StepRecordCodeUsed.Any())
                {
                    item.EntityCodeStr = string.Join(", ", item.StepRecordCodeUsed.Select(n => n.Name));
                }
            }
        }

        return new PagedResultDto<StepReportDto>(filter.Count(), query);
    }

    public async Task<StartAndEndGenerateDto> GenerateStampNumberAsync(int numberOfStamps)
    {
        var currentTenant = CurrentTenant.Id;
        var endNumber =
            (await recordShareRepository.GetQueryableAsync()).Where(n => n.SourceTenantId == currentTenant);
        if (!endNumber.Any())
        {
            return new StartAndEndGenerateDto
            {
                StartNumber = 1,
                EndNumber = numberOfStamps
            };
        }

        var startNumber = endNumber.Max(n => n.EndNumber) + 1;
        var endNumberResult = startNumber + numberOfStamps - 1; // Công thức này dc Dũng update ngày 20-03-2024
        return new StartAndEndGenerateDto
        {
            StartNumber = startNumber,
            EndNumber = endNumberResult
        };
    }

    public async Task<bool> CheckStampNumberInput(int stampNumber)
    {
        var currentTenant = CurrentTenant.Id;
        return !(await recordShareRepository.GetQueryableAsync()).Any(n =>
            n.SourceTenantId == currentTenant
            && n.StartNumber >= stampNumber
            && n.EndNumber <= stampNumber
        );
    }

    public async Task<ListResultDto<DropdownItemBaseDto>?> GetStepRecordDropdownAsync(Guid processStepId,
        List<Guid?>? entityIds)
    {
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == processStepId);
        if (processStep == null)
        {
            return null;
        }
        var userQuery = await userRepository.GetQueryableAsync();

        // Get previous step to get step record have status is done
        var previousStep = await processStepRepository.FirstOrDefaultAsync(n =>
            n.Position == processStep.Position - 1 && n.ProcessId == processStep.ProcessId);
        if (previousStep == null)
        {
            return null;
        }

        var query = (await stepRecordRepository.GetQueryableAsync())
            .Where(x => x.ProcessStepId == previousStep.Id && x.RecordStatus != (int)StepReportStatusEnum.Recording)
            .Select(x => x).ToList();
        var result = new List<DropdownItemBaseDto>();
        foreach (var item in query)
        {
            var createdUser = userQuery.FirstOrDefault(n => n.Id == item.CreatorId);
            var checkUserAll = (await entityStepRecordRepository.GetQueryableAsync())
                .Any(n => n.StepRecordId == item.Id && n.UseAll == (int)StepRecordUseAllEnum.All);
            if (entityIds != null && entityIds.Any(n => n != null && n != Guid.Empty))
            {
                if (entityIds.All(n => n != item.Id) && checkUserAll)
                {
                    continue;
                }
            }
            else
            {
                if (checkUserAll)
                {
                    continue;
                }
            }

            var processFieldObj = await processFieldRepository.FirstOrDefaultAsync(n =>
                n.StepId == item.ProcessStepId && n.DataType == (int)ProcessDataTypeEnum.Receptacle);
            if (processFieldObj == null)
            {
                result.Add(new DropdownItemBaseDto
                {
                    Id = item.Id,
                    Name = $"{item.Code} - {item.CreationTime:dd/MM/yyyy} - {createdUser?.Name ?? "Unknown"}"
                });
                continue;
            }

            var fieldRecordObj = await fieldRecordRepository.FirstOrDefaultAsync(n =>
                n.StepRecordId == item.Id && n.ProcessFieldId == processFieldObj.Id);
            if (fieldRecordObj == null)
            {
                result.Add(new DropdownItemBaseDto
                {
                    Id = item.Id,
                    Name = $"{item.Code} - {item.CreationTime:dd/MM/yyyy} - {createdUser?.Name ?? "Unknown"}"
                });
                continue;
            }

            var receptacleObj =
                await receptacleRepository.FirstOrDefaultAsync(n => n.Id == fieldRecordObj.ProcessFieldOptionId);
            if (receptacleObj == null)
            {
                continue;
            }

            result.Add(new DropdownItemBaseDto
            {
                Id = item.Id,
                Name = item.Code + " - " + item.CreationTime.ToString("dd/MM/yyyy") + " - " + receptacleObj.Code
            });
        }

        return new ListResultDto<DropdownItemBaseDto>(result);
    }
    
     public async Task<ListResultDto<DropdownItemForMobileDto>?> GetStepRecordDropdownMobileAsync(Guid processStepId,
        List<Guid?>? entityIds)
    {
        var processStep = await processStepRepository.FirstOrDefaultAsync(n => n.Id == processStepId);
        if (processStep == null)
        {
            return null;
        }

        // Get previous step to get step record have status is done
        var previousStep = await processStepRepository.FirstOrDefaultAsync(n =>
            n.Position == processStep.Position - 1 && n.ProcessId == processStep.ProcessId);
        if (previousStep == null)
        {
            return null;
        }
        var userQuery = await userRepository.GetQueryableAsync();
        var query = (await stepRecordRepository.GetQueryableAsync())
            .Where(x => x.ProcessStepId == previousStep.Id && x.RecordStatus != (int)StepReportStatusEnum.Recording)
            .Select(x => x).ToList();
        var result = new List<DropdownItemForMobileDto>();
        foreach (var item in query)
        {
            var createdUser = userQuery.FirstOrDefault(n => n.Id == item.CreatorId);
            
            var checkUserAll = (await entityStepRecordRepository.GetQueryableAsync())
                .Any(n => n.StepRecordId == item.Id && n.UseAll == (int)StepRecordUseAllEnum.All);
            if (entityIds != null && entityIds.Any(n => n != null && n != Guid.Empty))
            {
                if (entityIds.All(n => n != item.Id) && checkUserAll)
                {
                    continue;
                }
            }
            else
            {
                if (checkUserAll)
                {
                    continue;
                }
            }

            var processFieldObj = await processFieldRepository.FirstOrDefaultAsync(n =>
                n.StepId == item.ProcessStepId && n.DataType == (int)ProcessDataTypeEnum.Receptacle);
            if (processFieldObj == null)
            {
                result.Add(new DropdownItemForMobileDto
                {
                    Id = item.Id,
                    Name = $"{item.Code} - {item.CreationTime:dd/MM/yyyy} - {createdUser?.Name ?? "Unknown"}",
                    Code = item.Code
                });
                continue;
            }

            var fieldRecordObj = await fieldRecordRepository.FirstOrDefaultAsync(n =>
                n.StepRecordId == item.Id && n.ProcessFieldId == processFieldObj.Id);
            if (fieldRecordObj == null)
            {
                result.Add(new DropdownItemForMobileDto
                {
                    Id = item.Id,
                    Code = item.Code,
                    Name = $"{item.Code} - {item.CreationTime:dd/MM/yyyy} - {createdUser?.Name ?? "Unknown"}",
                });
                continue;
            }

            var receptacleObj =
                await receptacleRepository.FirstOrDefaultAsync(n => n.Id == fieldRecordObj.ProcessFieldOptionId);
            if (receptacleObj == null)
            {
                continue;
            }

            result.Add(new DropdownItemForMobileDto
            {
                Id = item.Id,
                Code = item.Code,
                Name = item.Code + " - " + item.CreationTime.ToString("dd/MM/yyyy") + " - " + receptacleObj.Code
            });
        }

        return new ListResultDto<DropdownItemForMobileDto>(result);
    }

    #endregion

    #region Get data for table Done, Share, recieved

    public async Task<PagedResultDto<StepReportDoneDto>> GetStepRecordDoneAsync(StepReportDoneFilterDto input)
    {
        var url = configuration["App:ClientUrl"];
        
        using (dataFilter.Disable<IMultiTenant>())
        {
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
            var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
            var companyQuery = await companyRepository.GetQueryableAsync();
            var productQuery = await productRepository.GetQueryableAsync();
            var userQuery = await userRepository.GetQueryableAsync();

            if (input.CreationDateEnd.HasValue)
            {
                input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
            }

            var filter = recordShareQuery
                .Where(n => n.SourceTenantId == CurrentTenant.Id && n.PartnerId == null &&
                            n.Status == (int)RecordShareStatusEnum.Done)
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                    n => input.Filter != null && n.TraceabilityCode.Contains(input.Filter))
                .WhereIf(input.ProductIds != null && input.ProductIds.Any(),
                    n => input.ProductIds != null && input.ProductIds.Contains(n.ProductId))
                .WhereIf(input.ProfileIds != null && input.ProfileIds.Any(),
                    n => input.ProfileIds != null && input.ProfileIds.Contains(n.CompanyProfileId))
                .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
                .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);
            var query = (from recordShare in filter
                    join stepRecord in stepRecordQuery on recordShare.StepRecordId equals stepRecord.Id
                    join product in productQuery on recordShare.ProductId equals product.Id
                    join companyProfile in companyProfileQuery on recordShare.CompanyProfileId equals companyProfile.Id
                    join createdUser in userQuery on recordShare.CreatorId equals createdUser.Id
                        into userJoin
                    from createdUser in userJoin.DefaultIfEmpty()
                    join companies in companyQuery on recordShare.SourceTenantId equals companies.TenantId
                        into companyJoin
                    from companies in companyJoin.DefaultIfEmpty()
                    join updatedUser in userQuery on recordShare.LastModifierId equals updatedUser.Id
                        into updatedUserJoin
                    from updatedUser in updatedUserJoin.DefaultIfEmpty()
                    select new StepReportDoneDto
                    {
                        Id = recordShare.Id,
                        TraceabilityCode = recordShare.TraceabilityCode,
                        ProductName = product.ProductName,
                        ProfileName = companyProfile.Name,
                        RecordCode = stepRecord.Code,
                        PartnerId = recordShare.PartnerId,
                        IsBackEnabled = recordShare.PartnerId == Guid.Empty,
                        CreationTime = recordShare.CreationTime,
                        NumberOfStamps = recordShare.NumberOfStamp,
                        ViewTraceabilityUrl = $"{companies.GS1Code}-{recordShare.EndNumber}",
                        ViewTraceabilityUrlFull =
                            $"{url}/t?d={companies.GS1Code}-{recordShare.EndNumber}",
                        CreatedBy = createdUser.Name + " (" + recordShare.CreationTime.ToString("dd/MM/yyyy HH:mm") +
                                    ")",
                        LastModifiedBy = updatedUser != null
                            ? recordShare.LastModificationTime.HasValue
                                ? updatedUser.Name + " (" +
                                  recordShare.LastModificationTime.Value.ToString("dd/MM/yyyy HH:mm") + ")"
                                : ""
                            : ""
                    }).OrderBy(input.Sorting ?? "CreationTime desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount).ToList();
            return new PagedResultDto<StepReportDoneDto>(filter.Count(), query);
        }
    }

    public async Task<PagedResultDto<StepReportReceivedDto>> GetStepRecordReceivedAsync(StepReportShareFilterDto input)
    {
        var url = configuration["App:ClientUrl"];
        
        using (dataFilter.Disable<IMultiTenant>())
        {
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
            var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
            var companyQuery = await companyRepository.GetQueryableAsync();
            var productQuery = await productRepository.GetQueryableAsync();
            var userQuery = await userRepository.GetQueryableAsync();
            var partnerQuery = await partnerRepository.GetQueryableAsync();

            if (input.CreationDateEnd.HasValue)
            {
                input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
            }

            var filter = recordShareQuery
                .Where(n => n.PartnerId != null && n.SharedTenantId == CurrentTenant.Id)
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                    n => input.Filter != null && n.TraceabilityCode.Contains(input.Filter))
                .WhereIf(input.ProductIds != null && input.ProductIds.Any(),
                    n => input.ProductIds != null && input.ProductIds.Contains(n.ProductId))
                .WhereIf(input.PartnerIds != null && input.PartnerIds.Any(),
                    n => input.PartnerIds != null && input.PartnerIds.Contains(n.CompanyProfileId))
                .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
                .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);
            var query = (from recordShare in filter
                    join stepRecord in stepRecordQuery on recordShare.StepRecordId equals stepRecord.Id
                    join product in productQuery on recordShare.ProductId equals product.Id
                    join partner in partnerQuery on recordShare.PartnerId equals partner.Id
                    join companyProfile in companyProfileQuery on recordShare.CompanyProfileId equals companyProfile.Id
                    join companies in companyQuery on recordShare.SourceTenantId equals companies.TenantId
                        into companyJoin
                    from companies in companyJoin.DefaultIfEmpty()
                    join createdUser in userQuery on recordShare.CreatorId equals createdUser.Id
                        into userJoin
                    from createdUser in userJoin.DefaultIfEmpty()
                    select new StepReportReceivedDto
                    {
                        Id = recordShare.Id,
                        TraceabilityCode = recordShare.TraceabilityCode,
                        NumberOfStamps = recordShare.NumberOfStamp,
                        LotId = recordShare.LotId,
                        ProductName = product.ProductName,
                        PartnerName = companyProfile.CompanyName,
                        RecordCode = stepRecord.Code,
                        PartnerId = recordShare.PartnerId,
                        CreationTime = recordShare.CreationTime,
                        SharedBy =
                            createdUser.Name + " (" + recordShare.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                        ViewTraceabilityUrl = $"{companies.GS1Code}-{recordShare.EndNumber}",
                        ViewTraceabilityUrlFull =
                            $"{url}/t?d=={companies.GS1Code}-{recordShare.EndNumber}"
                    }).OrderBy(input.Sorting ?? "CreationTime desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount).ToList();
            return new PagedResultDto<StepReportReceivedDto>(query.Count(), query);
        }
    }

    // todo: check tenant because total count and query is not same
    public async Task<PagedResultDto<StepReportReceivedDto>> GetStepRecordSharedAsync(StepReportShareFilterDto input)
    {
        var url = configuration["App:ClientUrl"];
        var recordShareQuery = await recordShareRepository.GetQueryableAsync();
        var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
        var companyQuery = await companyRepository.GetQueryableAsync();
        var productQuery = await productRepository.GetQueryableAsync();
        var userQuery = await userRepository.GetQueryableAsync();
        var partnerQuery = await partnerRepository.GetQueryableAsync();

        if (input.CreationDateEnd.HasValue)
        {
            input.CreationDateEnd = input.CreationDateEnd.Value.AddDays(1);
        }

        var filter = recordShareQuery
            .Where(n => n.PartnerId != null && n.SourceTenantId == CurrentTenant.Id)
            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                n => input.Filter != null && n.TraceabilityCode.Contains(input.Filter))
            .WhereIf(input.ProductIds != null && input.ProductIds.Any(),
                n => input.ProductIds != null && input.ProductIds.Contains(n.ProductId))
            .WhereIf(input.PartnerIds != null && input.PartnerIds.Any(),
                n => input.PartnerIds != null && input.PartnerIds.Contains(n.PartnerId ?? Guid.Empty)) // old is CompanyProfileId
            .WhereIf(input.CreationDateStart.HasValue, n => n.CreationTime >= input.CreationDateStart)
            .WhereIf(input.CreationDateEnd.HasValue, n => n.CreationTime <= input.CreationDateEnd);
        var query = (from recordShare in filter
                join stepRecord in stepRecordQuery on recordShare.StepRecordId equals stepRecord.Id
                join product in productQuery on recordShare.ProductId equals product.Id
                join partner in partnerQuery on recordShare.PartnerId equals partner.Id
                join companies in companyQuery on recordShare.SourceTenantId equals companies.TenantId
                    into companyJoin
                from companies in companyJoin.DefaultIfEmpty()
                join createdUser in userQuery on recordShare.CreatorId equals createdUser.Id
                    into userJoin
                from createdUser in userJoin.DefaultIfEmpty()
                select new StepReportReceivedDto
                {
                    Id = recordShare.Id,
                    TraceabilityCode = recordShare.TraceabilityCode,
                    NumberOfStamps = recordShare.NumberOfStamp,
                    LotId = recordShare.LotId,
                    ProductName = product.ProductName,
                    PartnerName = partner.Name,
                    RecordCode = stepRecord.Code,
                    PartnerId = recordShare.PartnerId,
                    CreationTime = recordShare.CreationTime,
                    SharedBy = createdUser.Name + " (" + recordShare.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    ViewTraceabilityUrl = $"{companies.GS1Code}-{recordShare.EndNumber}",
                    ViewTraceabilityUrlFull =
                        $"{url}/t?d={companies.GS1Code}-{recordShare.EndNumber}"
                }).OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<StepReportReceivedDto>(filter.Count(), query);
    }

    #endregion

    #region  export excel
    private async Task<List<StampExportDto>> PrintDataAsync(Guid recordShareId, string clientUrl)
    {
        try
        {
            var recordShareObj = await recordShareRepository.FirstOrDefaultAsync(n=>n.Id == recordShareId);
            if(recordShareObj == null)
            {
                throw new UserFriendlyException("Stamp not found");
            }
            var companyProfile = await companyProfileRepository.GetAsync(recordShareObj.CompanyProfileId);
            if(companyProfile == null)
            {
                throw new UserFriendlyException("Company profile not found");
            }
            var company = await companyRepository.FirstOrDefaultAsync(n=>n.TenantId == companyProfile.TenantId);
            if(company == null)
            {
                throw new UserFriendlyException("Company not found");
            }
            var result = new List<StampExportDto>();
            for (var i = recordShareObj.StartNumber; i <= recordShareObj.EndNumber; i++)
            {
                result.Add(new StampExportDto
                {
                    CompanyName = company.Name,
                    QRCode = $"{company.GS1Code}-{i}",
                    CreatedDate = recordShareObj.CreationTime.ToString("dd/MM/yyyy"),
                    TraceUrl = $"{clientUrl}/t?d={company.GS1Code}-{i}",
                });
            }
            return result;
        }
        catch (Exception e)
        {
            throw new UserFriendlyException(e.Message);
        }
    }
    public async Task<RecordExportResponseDto> GetExcelFileAsync(Guid stampId,string clientUrl)
    {
        var fileNameReturn = $"Stamp_{DateTime.Now:yyyyMMddHHmmss}.xlsx";

        var list = await PrintDataAsync(stampId, clientUrl);
        if (list.Count == 0)
        {
            // throw new UserFriendlyException("null data at here");
            return new RecordExportResponseDto(fileNameReturn, null);
        }
        
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "templates", "StampTemplate.xlsx");
        
        var directoryExportPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "exports");
        if (!Directory.Exists(directoryExportPath))
        {
            Directory.CreateDirectory(directoryExportPath);
        }
        var fileExportPath = Path.Combine(directoryExportPath, fileNameReturn);
        
        File.Copy(templatePath, fileExportPath, true);
        IWorkbook templateWorkbook;
        await using (var fs = new FileStream(fileExportPath, FileMode.Open, FileAccess.Read))
        {
            templateWorkbook = new XSSFWorkbook(fs);
        }

        var rowIndex = 4;
        const string sheetName = "QRCode";
        var sheet = templateWorkbook.GetSheet(sheetName) ?? templateWorkbook.CreateSheet(sheetName);
        foreach (var item in list)
        {
            var row = sheet.GetRow(rowIndex) ?? sheet.CreateRow(rowIndex);
            row.CreateCell(0).SetCellValue(rowIndex - 3);
            row.CreateCell(1).SetCellValue(item.CreatedDate);
            row.CreateCell(2).SetCellValue(item.QRCode);
            row.CreateCell(3).SetCellValue(item.TraceUrl);
            row.CreateCell(4).SetCellValue(item.Note);
            rowIndex++;
        }

        await using (var fs = new FileStream(fileExportPath, FileMode.Create, FileAccess.Write))
        {
            templateWorkbook.Write(fs);
        }
        var memory = new MemoryStream();
        await using (var stream = new FileStream(fileExportPath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;
        return new RecordExportResponseDto(fileNameReturn, memory.ToArray());
    }
    #endregion
}