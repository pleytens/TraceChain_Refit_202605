using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProductCategories;

public interface IProductCategoryAppService : ICrudAppService<ProductCategoryDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateProductCategoryDto>
{
    Task<PagedResultDto<ProductCategoryDto>> GetListCustomAsync(RequestCustomDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetProductCategoryDropdownAsync();
}