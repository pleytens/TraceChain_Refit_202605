using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EventBus.Distributed;
using Volo.Abp.MultiTenancy;
using Volo.Abp.ObjectExtending;
using Volo.Abp.ObjectMapping;
using Volo.Abp.TenantManagement;

namespace Traceverified.TraceFarm.Partners;

public class PartnerAppService : CrudAppService<
        Partner, //The Partner entity
        PartnerDto, //Used to show markets
        Guid, //Primary key of the market entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdatePartnerDto>, //Used to create/update a market, 
    IPartnerAppService
{
    private readonly IRepository<CompanyProfile, Guid> _companyProfileRepository;
    private readonly IRepository<Company, Guid> _companyRepository;
    private readonly DataFilter _dataFilter;
    private readonly IRepository<Partner, Guid> _partnerRepository;
    private readonly IRepository<RecordShare, Guid> _recordShareRepository;

    public PartnerAppService(IRepository<Partner, Guid> repository,
        IRepository<Company, Guid> companyRepository,
        DataFilter dataFilter,
        IRepository<RecordShare, Guid> recordShareRepository,
        IRepository<CompanyProfile, Guid> companyProfileRepository,
        IDataSeeder dataSeeder,
        ITenantManager tenantManager,
        IDistributedEventBus distributedEventBus, ITenantRepository tenantRepository) :
        base(repository)
    {
        _partnerRepository = repository;
        _companyRepository = companyRepository;
        _dataFilter = dataFilter;
        _recordShareRepository = recordShareRepository;
        _companyProfileRepository = companyProfileRepository;
        DataSeeder = dataSeeder;
        TenantManager = tenantManager;
        DistributedEventBus = distributedEventBus;
        TenantRepository = tenantRepository;
        GetPolicyName = TraceFarmPermissions.Partners.Default;
        GetListPolicyName = TraceFarmPermissions.Partners.Default;
        CreatePolicyName = TraceFarmPermissions.Partners.Create;
        UpdatePolicyName = TraceFarmPermissions.Partners.Edit;
        DeletePolicyName = TraceFarmPermissions.Partners.Delete;
    }

    private IDataSeeder DataSeeder { get; }
    private ITenantRepository TenantRepository { get; }
    private ITenantManager TenantManager { get; }
    private IDistributedEventBus DistributedEventBus { get; }

    public async Task<PagedResultDto<PartnerDto>> GetListCustomAsync(PartnerFilterDto input)
    {
        var query = await _partnerRepository.GetQueryableAsync();

        var filter = query
            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                n => n.Name.ToLower().Contains(input.Filter.ToLower())
                     || n.Gs1Code.ToLower().Contains(input.Filter.ToLower()))
            .WhereIf(input.NationId != null, n => n.NationId == input.NationId)
            .WhereIf(input.ProvinceId != null, n => n.ProvinceId == input.ProvinceId)
            .WhereIf(input.DistrictId != null, n => n.DistrictId == input.DistrictId)
            .WhereIf(input.WardId != null, n => n.WardId == input.WardId);

        var result = filter.Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .Select(n => new PartnerDto
            {
                Id = n.Id,
                Name = n.Name,
                Address = n.Address,
                Gs1Code = n.Gs1Code,
                NationId = n.NationId,
                ProvinceId = n.ProvinceId,
                DistrictId = n.DistrictId,
                WardId = n.WardId,
                PhoneNumber = n.PhoneNumber,
                Email = n.Email,
                Website = n.Website,
                Latitude = n.Latitude,
                Longitude = n.Longitude
            })
            .OrderBy(input.Sorting ?? "Name")
            .ToList();
        return new PagedResultDto<PartnerDto>(filter.Count(), result);
    }

    public async Task<PartnerDto?> GetCompanyInfoAsync(string gs1Code)
    {
        var partner = await _partnerRepository.FirstOrDefaultAsync(n => n.Gs1Code == gs1Code);
        if (partner != null)
        {
            throw new UserFriendlyException("::Partner:AlreadyExists");
        }

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var result = new PartnerDto();
            var company = await _companyRepository.FirstOrDefaultAsync(n => n.GS1Code == gs1Code);
            if (company == null)
            {
                return null;
            }

            result.Name = company.Name;
            result.Address = company.Address ?? "";
            result.Gs1Code = company.GS1Code;
            result.NationId = company.NationId;
            result.ProvinceId = company.ProvinceId;
            result.DistrictId = company.DistrictId;
            result.WardId = company.WardId;
            result.PhoneNumber = company.PhoneNumber;
            result.Email = company.EmailAddress;
            result.Website = company.WebsiteUrl;
            result.Latitude = company.Latitude;
            result.Longitude = company.Longitude;
            result.CompanyId = company.Id;
            return result;
        }
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetPartnerDropdownAsync()
    {
        var query = (await _partnerRepository.GetQueryableAsync())
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetSupplierDropdownAsync()
    {
        var recordShareQuery = await _recordShareRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();
        var currentTenantId = CurrentTenant.Id;
        using (_dataFilter.Disable<IMultiTenant>())
        {
            var demo = recordShareQuery.Count(n => n.SharedTenantId == currentTenantId);

            var query = recordShareQuery.Where(n => n.SharedTenantId == currentTenantId)
                .Join(companyProfileQuery,
                    recordShare => recordShare.CompanyProfileId,
                    companyProfile => companyProfile.Id,
                    (recordShare, companyProfile) => new { recordShare, companyProfile })
                .GroupBy(x => x.companyProfile)
                .Select(g => new DropdownItemBaseDto
                {
                    Id = g.Key.Id,
                    Name = g.Key.CompanyName
                });

            return new ListResultDto<DropdownItemBaseDto>(query.ToList());
        }
    }

    public override Task<PartnerDto> UpdateAsync(Guid id, CreateUpdatePartnerDto input)
    {
        input.TenantId = CurrentTenant.Id;
        return base.UpdateAsync(id, input);
    }

    // todo: Will be implemented later
    // public override async Task<PartnerDto> CreateAsync(CreateUpdatePartnerDto input)
    // {
    //     input.TenantId = CurrentTenant.Id;
    //     if (input.CompanyId != null)
    //     {
    //         return await base.CreateAsync(input);
    //     }
    //     var tenantObj = new TenantCreateDto()
    //     {
    //         AdminEmailAddress = input.Email,
    //         AdminPassword = "1q2w3E*",
    //         Name = input.Gs1Code
    //     };
    //     var tenantDto = await CreateAsync(tenantObj);
    //     var companyDto = ObjectMapper.Map<CreateUpdatePartnerDto, CreateUpdateCompanyDto>(input);
    //     companyDto.EmailAddress = string.IsNullOrEmpty(input.Email) ? "" : input.Email;
    //     companyDto.AdminPassword = "1q2w3E*";
    //     companyDto.TenantName = input.Gs1Code;
    //     companyDto.AdminEmailAddress = string.IsNullOrEmpty(input.Email) ? "" : input.Email;
    //     companyDto.TenantId = tenantDto.Id;
    //     var companyInsert = ObjectMapper.Map<CreateUpdateCompanyDto, Company>(companyDto);
    //     var company = await _companyRepository.InsertAsync(companyInsert);
    //     
    //     input.CompanyId = company.Id;
    //     return await base.CreateAsync(input);
    // }

    private async Task<TenantDto> CreateAsync(TenantCreateDto input)
    {
        var tenant = await TenantManager.CreateAsync(input.Name);
        await CurrentUnitOfWork.SaveChangesAsync();
        input.MapExtraPropertiesTo(tenant);

        await TenantRepository.InsertAsync(tenant);
        await CurrentUnitOfWork.SaveChangesAsync();

        await DistributedEventBus.PublishAsync(
            new TenantCreatedEto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Properties =
                {
                    { "AdminEmail", input.AdminEmailAddress },
                    { "AdminPassword", input.AdminPassword }
                }
            });
        using (CurrentTenant.Change(tenant.Id, tenant.Name))
        {
            //TODO: Handle database creation?
            // TODO: Seeder might be triggered via event handler.
            await DataSeeder.SeedAsync(
                new DataSeedContext(tenant.Id)
                    .WithProperty("AdminEmail", input.AdminEmailAddress)
                    .WithProperty("AdminPassword", input.AdminPassword)
            );
        }

        return ObjectMapper.Map<Tenant, TenantDto>(tenant);
    }
}