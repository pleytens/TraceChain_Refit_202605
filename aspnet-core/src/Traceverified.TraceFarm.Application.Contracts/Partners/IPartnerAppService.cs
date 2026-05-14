using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Partners;

public interface
    IPartnerAppService : ICrudAppService<PartnerDto, Guid, PagedAndSortedResultRequestDto, CreateUpdatePartnerDto>
{
    Task<PagedResultDto<PartnerDto>> GetListCustomAsync(PartnerFilterDto input);
    Task<PartnerDto?> GetCompanyInfoAsync(string gs1Code);
    Task<ListResultDto<DropdownItemBaseDto>> GetPartnerDropdownAsync();
    Task<ListResultDto<DropdownItemBaseDto>> GetSupplierDropdownAsync();
}