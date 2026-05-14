using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.SupplierManagements;

public interface
    ISupplierAppService : ICrudAppService<SupplierDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateSupplierDto>
{
    Task<PagedResultDto<SupplierDto>> GetListCustomAsync(SupplierFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync();
}