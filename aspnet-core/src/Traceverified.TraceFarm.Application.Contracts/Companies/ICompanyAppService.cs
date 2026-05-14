using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Companies;

public interface
    ICompanyAppService : ICrudAppService<CompanyDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateCompanyDto>
{
    Task<PagedResultDto<CompanyDto>> GetListCustomAsync(CompanyFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetCompanyDropdownAsync();
    Task<CompanyDto>  CreateNotCreateTenantAsync(CreateUpdateCompanyDto input);
    Task<CompanyDto> GetByTenantAsync(Guid tenantId);
    Task<CompanyDto> UpdateByAdminAsync(Guid id, CreateUpdateCompanyDto input);
}