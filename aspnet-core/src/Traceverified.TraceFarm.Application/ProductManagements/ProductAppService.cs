using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Markets;
using Traceverified.TraceFarm.ProductCategories;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.ProductManagements;

public class ProductAppService(
    IRepository<Product, Guid> productRepository,
    IDataFilter dataFilter,
    IRepository<Market, Guid> marketRepository,
    IRepository<ProductCategory, Guid> productCategoryRepository,
    IRepository<ProductExpirationTime, Guid> productExpirationTimeRepository,
    IStorageAppService storageAppService,
    IRepository<ImageStorage, Guid> imageStorageRepository)
    : CrudAppService<
            Product,
            ProductDto,
            Guid,
            PagedAndSortedResultRequestDto,
            CreateUpdateProductDto>(productRepository),
        IProductAppService
{
    private readonly IRepository<Product, Guid> _productRepository = productRepository;

    public async Task<PagedResultDto<ProductDto>> GetListCustomAsync(ProductFilterDto input)
    {
        var marketQuery = await marketRepository.GetQueryableAsync();
        var productCategoryQuery = await productCategoryRepository.GetQueryableAsync();
        var productQuery = await _productRepository.GetQueryableAsync();

        var query = productQuery.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.ProductName.ToLower().Contains(input.Filter.ToLower()))
            .WhereIf(input.MarketId.HasValue, n => n.MarketId == input.MarketId)
            .WhereIf(input.ProductCategoryId.HasValue, n => n.ProductCategoryId == input.ProductCategoryId);
        var joinQuery = from product in query
            join market in marketQuery on product.MarketId equals market.Id
                into marketJoin
            from market in marketJoin.DefaultIfEmpty()
            join productCategory in productCategoryQuery on product.ProductCategoryId equals productCategory.Id
            select new ProductDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                MarketName = market.Name,
                ProductCategoryName = productCategory.Name,
                CreationTime = product.CreationTime,
                GtinCode = product.GtinCode,
            };
        var result = joinQuery
            .OrderBy(input.Sorting ?? "ProductName")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<ProductDto>(joinQuery.Count(), result);
    }

    public override async Task<ProductDto> CreateAsync(CreateUpdateProductDto input)
    {
        var checkGtinCodeExist = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == input.GtinCode);
        if (checkGtinCodeExist != null)
        {
            throw new UserFriendlyException("Product:GtinCode:Exist");
        }
        var output = await base.CreateAsync(input);
        if (output == null)
        {
            return output ?? new ProductDto();
        }
        if (input.Images != null && input.Images.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.Images.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.Product,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }

        if (input.VideoUrls != null && input.VideoUrls.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.VideoUrls.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.ProductYoutubeUrl,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }

        if (input.CertificationImages != null && input.CertificationImages.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.CertificationImages.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.ProductCertification,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }


        if (input.DocumentFiles == null || !input.DocumentFiles.Any())
        {
            return output;
        }

        var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();
        var updateLst = imageStorageQuery.Where(n => input.DocumentFiles.Contains(n.Id)).ToList();
        
        foreach (var document in updateLst)
        {
            document.RelatedEntityId = output.Id;
            document.Status = (int)ImageStorageStatusEnum.Published;
        }

        await imageStorageRepository.UpdateManyAsync(updateLst);
        return output;
    }

    public async Task<ProductDto> CreateForGenQrAsync(CreateUpdateProductForGenQrDto input)
    {
        var checkGtinCodeExist = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == input.GtinCode);
        if (checkGtinCodeExist != null)
        {
            throw new UserFriendlyException("Product:GtinCode:Exist");
        }
        var output = await base.CreateAsync(input);
        if (output == null)
        {
            return output ?? new ProductDto();
        }
        
        if (input.Images != null && input.Images.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.Images.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.Product,
                ImageName = n,
                TenantId = input.TenantId
            }).ToList());
        }

        if (input.VideoUrls != null && input.VideoUrls.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.VideoUrls.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.ProductYoutubeUrl,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }
        
        if (input.CertificationImages != null && input.CertificationImages.Any())
        {
            await imageStorageRepository.InsertManyAsync(input.CertificationImages.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Id,
                RelatedEntityType = (int)ImageStorageEnum.ProductCertification,
                ImageName = n,
                TenantId = input.TenantId
            }).ToList());
        }

        return output;
    }
    
    public override async Task<ProductDto> UpdateAsync(Guid id, CreateUpdateProductDto input)
    {
        var checkGtinCodeExist = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == input.GtinCode && n.Id != id);
        if (checkGtinCodeExist != null)
        {
            throw new UserFriendlyException("Product:GtinCode:Exist");
        }
        
        if (input.Images != null && input.Images.Any())
        {
            await imageStorageRepository.DeleteAsync(n =>
                n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.Product);
            await imageStorageRepository.InsertManyAsync(input.Images.Select(n => new ImageStorage
            {
                RelatedEntityId = id,
                RelatedEntityType = (int)ImageStorageEnum.Product,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }
        
        if (input.VideoUrls != null && input.VideoUrls.Any())
        {
            await imageStorageRepository.DeleteAsync(n =>
                n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.ProductYoutubeUrl);
            await imageStorageRepository.InsertManyAsync(input.VideoUrls.Select(n => new ImageStorage
            {
                RelatedEntityId = id,
                RelatedEntityType = (int)ImageStorageEnum.ProductYoutubeUrl,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }

        if (input.CertificationImages != null && input.CertificationImages.Any())
        {
            await imageStorageRepository.DeleteAsync(n =>
                n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.ProductCertification);
            await imageStorageRepository.InsertManyAsync(input.CertificationImages.Select(n => new ImageStorage
            {
                RelatedEntityId = id,
                RelatedEntityType = (int)ImageStorageEnum.ProductCertification,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }
        var output = await base.UpdateAsync(id, input);
        var imageStorageQuery = await imageStorageRepository.GetQueryableAsync();
        var documentByProduct = imageStorageQuery.Where(n => n.RelatedEntityId == id 
                                                             && n.RelatedEntityType == (int)ImageStorageEnum.ProductFile).ToList();
        var documentDeleteFiles = documentByProduct
            .WhereIf(input.DocumentFiles?.Any() == true,
                n => input.DocumentFiles != null && !input.DocumentFiles.Contains(n.Id))
            .ToList();
        await imageStorageRepository.DeleteManyAsync(documentDeleteFiles);
        if (input.DocumentFiles == null || !input.DocumentFiles.Any())
        {
            return output;
        }
        
        var updateLst = imageStorageQuery.Where(n => input.DocumentFiles.Contains(n.Id)).ToList();
        
        foreach (var document in updateLst)
        {
            document.RelatedEntityId = output.Id;
            document.Status = (int)ImageStorageStatusEnum.Published;
        }

        await imageStorageRepository.UpdateManyAsync(updateLst);
        
        return output;
    }

    public override async Task<ProductDto> GetAsync(Guid id)
    {
        var images = await imageStorageRepository.GetListAsync(n =>
            n.RelatedEntityId == id && (n.RelatedEntityType >= (int)ImageStorageEnum.ProductCertification ||
                                        n.RelatedEntityType <= (int)ImageStorageEnum.ProductYoutubeUrl ||
                                        n.RelatedEntityType <= (int)ImageStorageEnum.ProductFile));
        var output = await base.GetAsync(id);
        output.CertificateImagesBase64 = [];
        output.ImagesBase64 = [];
        output.VideoUrls = [];
        output.DocumentFiles = [];
        
        foreach (var image in images)
        {
            switch (image.RelatedEntityType)
            {
                case (int)ImageStorageEnum.ProductCertification:
                    output.CertificateImagesBase64.Add(storageAppService.GetBase64Image(image.ImageName));
                    output.CertificateImagesUrls.Add(storageAppService.GetFileUrl(image.ImageName));
                    output.CertificateImagesName.Add(image.ImageName);
                    break;
                case (int)ImageStorageEnum.ProductYoutubeUrl:
                    output.VideoUrls.Add(image.ImageName);
                    break;
                case (int)ImageStorageEnum.ProductFile:
                    output.DocumentFiles.Add(new ProductDocumentFileDto()
                    {
                        Id =  image.Id,
                        Name = image.ImageNameRaw??image.ImageName,
                        Url = storageAppService.GetFileUrl(image.ImageName)
                    });
                    break;
                default:
                    output.ImagesBase64.Add(storageAppService.GetBase64Image(image.ImageName));
                    output.ImagesUrls.Add(storageAppService.GetFileUrl(image.ImageName));
                    output.ImagesName.Add(image.ImageName);
                    break;
            }
        }

        return output;
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetProductDropdownAsync()
    {
        var query = (await _productRepository.GetQueryableAsync())
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.ProductName
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    [RemoteService(false)]
    public async Task<ProductDto> GetProductForFreeQrCode(Guid productId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await _productRepository.GetAsync(productId);
            return product == null ? throw new UserFriendlyException(L["ProductNotExist"]) : ObjectMapper.Map<Product, ProductDto>(product);
        }
    }

    [RemoteService(false)]
    public async Task<bool> CheckGtinCode(string gtinCode)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            return await _productRepository.AnyAsync(n => n.GtinCode == gtinCode);
        }
    }

    public async Task<ProductDto?> GetProductByGtinCodeAsync(string gtinCode)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == gtinCode);
            if (product == null)
            {
                return null;
            }
            var result = ObjectMapper.Map<Product, ProductDto>(product);
            
            return result;
        }
    }

    public async Task<Guid?> GetProductIdByGtinCodeAsync(string gtinCode)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == gtinCode);
            return product?.Id;
        }
    }

    [AllowAnonymous]
    public async Task<bool> GetCheckExpiredTimeProduct(string gtinCode)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await _productRepository.FirstOrDefaultAsync(n => n.GtinCode == gtinCode);
            if (product == null)
            {
                return false;
            }
            var productExpireDate = await productExpirationTimeRepository.FirstOrDefaultAsync(n => n.ProductId == product.Id);
            if (productExpireDate != null)
            {
                return productExpireDate.ExpirationTime.Date > DateTime.Today;
            }
            return product.CreationTime.Date.AddDays(90) > DateTime.Today;
        }
    }

    public async Task<bool> ExtendActiveTime(Guid productId, DateTime expirationTime)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var product = await _productRepository.FirstOrDefaultAsync(n => n.Id == productId);
            if (product == null)
            {
                throw new UserFriendlyException(L["ProductNotExist"]);
            }
            var productExpireDate = await productExpirationTimeRepository.FirstOrDefaultAsync(n => n.ProductId == product.Id);
            if (productExpireDate != null)
            {
                productExpireDate.ExpirationTime = expirationTime;
            }
            else
            {
                productExpireDate = new ProductExpirationTime()
                {
                    ExpirationTime = expirationTime,
                    ProductId = product.Id
                };
                await productExpirationTimeRepository.InsertAsync(productExpireDate);
            }
            return true;
        }
    }
}