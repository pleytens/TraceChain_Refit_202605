using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.ProductCategories;

public class ProductCategoryAppService : CrudAppService<
        ProductCategory, //The Market entity
        ProductCategoryDto, //Used to show markets
        Guid, //Primary key of the market entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateProductCategoryDto>, //Used to create/update a market, 
    IProductCategoryAppService
{
    private readonly IRepository<ProductCategory, Guid> _productCategoryRepository;

    public ProductCategoryAppService(IRepository<ProductCategory, Guid> productCategoryRepository) : base(
        productCategoryRepository)
    {
        _productCategoryRepository = productCategoryRepository;
        GetPolicyName = TraceFarmPermissions.ProductCategories.Default;
        GetListPolicyName = TraceFarmPermissions.ProductCategories.Default;
        CreatePolicyName = TraceFarmPermissions.ProductCategories.Create;
        UpdatePolicyName = TraceFarmPermissions.ProductCategories.Edit;
        DeletePolicyName = TraceFarmPermissions.ProductCategories.Delete;
    }

    public async Task<PagedResultDto<ProductCategoryDto>> GetListCustomAsync(RequestCustomDto input)
    {
        var query = await _productCategoryRepository.GetQueryableAsync();
        var filter = query.WhereIf(!string.IsNullOrEmpty(input.Filter),
            n => n.Name.ToLower().Contains(input.Filter.ToLower()));

        var result = filter.Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .Select(n => new ProductCategoryDto
            {
                Id = n.Id,
                Name = n.Name,
                ProductCount = 0
            })
            .OrderBy(input.Sorting ?? "Name")
            .ToList();

        return new PagedResultDto<ProductCategoryDto>(filter.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetProductCategoryDropdownAsync()
    {
        var query = (await _productCategoryRepository.GetListAsync())
            .Where(x => !x.IsDeleted)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }
}