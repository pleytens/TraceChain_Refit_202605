using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Companies;

public interface
    ICompanyProfileAppService : ICrudAppService<CompanyProfileDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateCompanyProfileDto>
{
    Task<PagedResultDto<CompanyProfileDto>> GetListCustomAsync(CompanyProfileFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync();
    Task<CompanyProfileDto> CreateForGenQrCodeAsync(CreateUpdateCompanyProfileDto input);
}