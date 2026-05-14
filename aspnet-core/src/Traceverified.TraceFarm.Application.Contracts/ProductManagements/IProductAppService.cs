using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.ProductManagements;

public interface
    IProductAppService : ICrudAppService<ProductDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateProductDto>
{
    Task<PagedResultDto<ProductDto>> GetListCustomAsync(ProductFilterDto input);
    Task<ListResultDto<DropdownItemBaseDto>> GetProductDropdownAsync();
    Task<ProductDto> CreateForGenQrAsync(CreateUpdateProductForGenQrDto input);
    Task<ProductDto> GetProductForFreeQrCode(Guid productId);
    Task<bool> CheckGtinCode(string gtinCode);
    
    Task<ProductDto?> GetProductByGtinCodeAsync(string gtinCode);
    Task<Guid?> GetProductIdByGtinCodeAsync(string gtinCode);
    
    Task<bool> GetCheckExpiredTimeProduct(string gtinCode);
    Task<bool> ExtendActiveTime(Guid productId, DateTime expirationTime);
}