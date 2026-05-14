using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.Share;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.TenantManagement;

namespace Traceverified.TraceFarm.Companies;

public class CompanyAppService : CrudAppService<
        Company, //The Market entity
        CompanyDto, //Used to show markets
        Guid, //Primary key of the market entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateCompanyDto>, //Used to create/update a market, 
    ICompanyAppService
{
    private readonly IRepository<Company, Guid> _companyRepository;
    private readonly IDataFilter _dataFilter;
    private readonly IStorageAppService _storageAppService;
    private readonly ITenantAppService _tenantAppService;
    private readonly ITenantManager _tenantManager;
    private readonly IRepository<Tenant, Guid> _tenantRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public CompanyAppService(
        IRepository<Company, Guid> repository,
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<Tenant, Guid> tenantRepository,
        IDataFilter dataFilter,
        ITenantAppService tenantAppService, ITenantManager tenantManager, IStorageAppService storageAppService) : base(
        repository
    )
    {
        _companyRepository = repository;
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _dataFilter = dataFilter;
        _tenantAppService = tenantAppService;
        _tenantManager = tenantManager;
        _storageAppService = storageAppService;
    }

    [Authorize(TraceFarmPermissions.Companies.Default)]
    public async Task<PagedResultDto<CompanyDto>> GetListCustomAsync(CompanyFilterDto input)
    {
        using (_dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var tenantQuery = await _tenantRepository.GetQueryableAsync();
            var userQuery = (await _userRepository.GetQueryableAsync()).Where(n => n.UserName == "admin");
            var queryFilter = companyQuery
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                    n => input.Filter != null && (n.Name.ToLower().Contains(input.Filter.ToLower()) || 
                                                     n.GS1Code.ToLower().Contains(input.Filter.ToLower())))
                .WhereIf(input.ProvinceId.HasValue, n => n.ProvinceId == input.ProvinceId.Value)
                .WhereIf(input.DistrictId.HasValue, n => n.DistrictId == input.DistrictId.Value)
                .WhereIf(input.WardId.HasValue, n => n.WardId == input.WardId.Value);
            var joinQuery = from company in queryFilter
                join user in userQuery on company.TenantId equals user.TenantId
                join tenant in tenantQuery on company.TenantId equals tenant.Id
                select new CompanyDto
                {
                    Id = company.Id,
                    Name = company.Name,
                    GS1Code = company.GS1Code,
                    Address = company.Address,
                    ProvinceId = company.ProvinceId,
                    DistrictId = company.DistrictId,
                    WardId = company.WardId,
                    CreationTime = company.CreationTime,
                    UserName = user.Email,
                    TenantName = tenant.Name,
                    TenantId = tenant.Id
                };
            var result = joinQuery
                .OrderBy(input.Sorting ?? "Name")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount).ToList();
            return new PagedResultDto<CompanyDto>(queryFilter.Count(), result);
        }
    }

    public override async Task<CompanyDto> UpdateAsync(Guid id, CreateUpdateCompanyDto input)
    {
        var tenantQuery = await _tenantRepository.GetQueryableAsync();

        var tenant = tenantQuery.FirstOrDefault(n => n.Id == input.TenantId);
        if (tenant != null)
        {
            await _tenantManager.ChangeNameAsync(tenant, input.TenantName);
            input.TenantId = tenant.Id;
        }

        return await base.UpdateAsync(id, input);
    }
    
    [Authorize(TraceFarmPermissions.CompanyProfiles.Edit)]
    public async Task<CompanyDto> UpdateByAdminAsync(Guid id, CreateUpdateCompanyDto input)
    {
        var tenantQuery = await _tenantRepository.GetQueryableAsync();

        var tenant = tenantQuery.FirstOrDefault(n => n.Id == input.TenantId);
        if (tenant != null)
        {
            await _tenantManager.ChangeNameAsync(tenant, input.TenantName);
            input.TenantId = tenant.Id;
        }

        return await base.UpdateAsync(id, input);
    }

    public override Task<CompanyDto> CreateAsync(CreateUpdateCompanyDto input)
    {
        input.IsActive = true;
        var tenant = new TenantCreateDto
        {
            Name = input.TenantName,
            AdminEmailAddress = input.AdminEmailAddress,
            AdminPassword = input.AdminPassword
        };
        var result = _tenantAppService.CreateAsync(tenant).Result;
        if (result.Id == Guid.Empty)
        {
            throw new UserFriendlyException("Create tenant failed");
        }

        input.TenantId = result.Id;
        return base.CreateAsync(input);
    }
    
    public Task<CompanyDto> CreateNotCreateTenantAsync(CreateUpdateCompanyDto input)
    {
        return base.CreateAsync(input);
    }
    public async Task<ListResultDto<DropdownItemBaseDto>> GetCompanyDropdownAsync()
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

    public override async Task<CompanyDto> GetAsync(Guid id)
    {
        var result = base.GetAsync(id);
        var tenant = await _tenantRepository.GetAsync(result.Result.TenantId);
        result.Result.TenantName = tenant.Name;
        if (result.Result.Logo != null)
        {
            result.Result.ImageUrl = _storageAppService.GetBase64Image(result.Result.Logo);
        }

        return result.Result;
    }
    
    public async Task<CompanyDto> GetByTenantAsync(Guid tenantId)
    {
        var result = await _companyRepository.FirstOrDefaultAsync(n=>n.TenantId == tenantId);
        if (result == null)
        {
            return new CompanyDto();
        }
        
        var companyDto = ObjectMapper.Map<Company, CompanyDto>(result);
        var tenant = await _tenantRepository.GetAsync(tenantId);
        companyDto.TenantName = tenant.Name;
        if (companyDto.Logo != null)
        {
            companyDto.ImageUrl = _storageAppService.GetFileUrl(companyDto.Logo);
        }

        return companyDto;
    }
}