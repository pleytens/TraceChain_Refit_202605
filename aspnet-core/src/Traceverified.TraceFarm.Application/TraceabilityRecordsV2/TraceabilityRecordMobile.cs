using System;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.Share;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class TraceabilityRecordMobile(IDataFilter dataFilter, 
    ITraceabilityRecordV2AppService traceabilityRecordV2AppService,
    IRepository<RecordShare, Guid> recordShareRepository,
    IRepository<Company, Guid> companyRepository,
    IRepository<Partner, Guid> partnerRepository,
    IRepository<StepRecord, Guid> stepRecordRepository,
    IRepository<Product, Guid> productRepository,
    IRepository<CompanyProfile, Guid> companyProfileRepository,
    IRepository<IdentityUser, Guid> userRepository): ApplicationService, ITraceabilityRecordMobile
{ 
    public async Task<PagedResultDto<ProcessRecordOutputDto>> PostProcessRecordAsync(ProcessRecordFilterDto input)
    {
        return await traceabilityRecordV2AppService.GetProcessRecordAsync(input);
    }

    public async Task<PagedResultDto<StepReportDto>> PostFirstStepReportAsync(StepReportFilterDto input)
    {
        return await traceabilityRecordV2AppService.GetFirstStepReportAsync(input);
    }

    public async Task<PagedResultDto<StepReportDto>> PostNormalStepReportAsync(StepReportFilterDto input)
    {
        return await traceabilityRecordV2AppService.GetNormalStepReportAsync(input);
    }

    public async Task<PagedResultDto<StepReportDto>> PostLastStepReportAsync(StepReportFilterDto input)
    {
        return await traceabilityRecordV2AppService.GetLastStepReportAsync(input);
    }

    public async Task<ListResultDto<DropdownItemForMobileDto>?> PostStepRecordDropdownAsync(StepRecordDropdownFilterDto input)
    {
        return await traceabilityRecordV2AppService.GetStepRecordDropdownMobileAsync(input.ProcessStepId, input.EntityIds);
    }

    public async Task<StepReportReceivedDto> GetRecordByCodeAsync(string input)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var traceCodeSplit = input.Split('-');
            if (traceCodeSplit.Length != 2)
            {
                throw new UserFriendlyException(L["TraceCode:Error:Invalid"]);
            }
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();
            var stepRecordQuery = await stepRecordRepository.GetQueryableAsync();
            var companyProfileQuery = await companyProfileRepository.GetQueryableAsync();
            var companyQuery = await companyRepository.GetQueryableAsync();
            var productQuery = await productRepository.GetQueryableAsync();
            var userQuery = await userRepository.GetQueryableAsync();
            var partnerQuery = await partnerRepository.GetQueryableAsync();
            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var filter = recordShareQuery;
            var query = (from recordShare in filter
                join stepRecord in stepRecordQuery on recordShare.StepRecordId equals stepRecord.Id
                join product in productQuery on recordShare.ProductId equals product.Id
                join companies in companyQuery on recordShare.SourceTenantId equals companies.TenantId
                    into companyJoin
                from companies in companyJoin.DefaultIfEmpty()
                join createdUser in userQuery on recordShare.CreatorId equals createdUser.Id
                    into userJoin
                from createdUser in userJoin.DefaultIfEmpty()
                where companies.GS1Code == traceCodeSplit[0]
                        && recordShare.StartNumber <= traceabilityCode
                        && recordShare.EndNumber >= traceabilityCode
                select new StepReportReceivedDto
                {
                    Id = recordShare.Id,
                    TraceabilityCode = recordShare.TraceabilityCode,
                    NumberOfStamps = recordShare.NumberOfStamp,
                    LotId = recordShare.LotId,
                    ProductName = product.ProductName,
                    RecordCode = stepRecord.Code,
                    CreationTime = recordShare.CreationTime,
                    SharedBy =
                        createdUser.Name + " (" + recordShare.CreationTime.ToString("dd/MM/yyyy HH:mm") + ")",
                    ViewTraceabilityUrl = $"{companies.GS1Code}-{recordShare.EndNumber}",
                    ViewTraceabilityUrlFull =
                        $"https://traceability.traceverified.com/t?d=={companies.GS1Code}-{recordShare.EndNumber}"
                }).FirstOrDefault();
            
            return query ?? throw new UserFriendlyException(L["TraceCode:Error:NotFound"]);
        }
    }
}