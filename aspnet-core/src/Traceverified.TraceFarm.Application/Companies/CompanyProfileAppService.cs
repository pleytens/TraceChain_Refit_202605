using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Markets;
using Traceverified.TraceFarm.ProductCategories;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.Companies;

public class CompanyProfileAppService : CrudAppService<
        CompanyProfile,
        CompanyProfileDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateCompanyProfileDto>,
    ICompanyProfileAppService
{
    private readonly IRepository<CompanyProfile, Guid> _companyProfileRepository;
    private readonly IRepository<ImageStorage, Guid> _imageStorageRepository;
    private readonly IRepository<Market, Guid> _marketRepository;
    private readonly IRepository<ProductCategory, Guid> _productCategoryRepository;
    private readonly IStorageAppService _storageAppService;

    public CompanyProfileAppService(IRepository<CompanyProfile, Guid> repository,
        IRepository<Market, Guid> marketRepository,
        IRepository<ProductCategory, Guid> productCategoryRepository,
        IDataFilter dataFilter, IRepository<ImageStorage, Guid> imageStorageRepository,
        IStorageAppService storageAppService) : base(repository)
    {
        _companyProfileRepository = repository;
        _marketRepository = marketRepository;
        _productCategoryRepository = productCategoryRepository;
        _imageStorageRepository = imageStorageRepository;
        _storageAppService = storageAppService;
    }

    public async Task<PagedResultDto<CompanyProfileDto>> GetListCustomAsync(CompanyProfileFilterDto input)
    {
        var marketQuery = await _marketRepository.GetQueryableAsync();
        var productCategoryQuery = await _productCategoryRepository.GetQueryableAsync();
        var companyProfileQuery = await _companyProfileRepository.GetQueryableAsync();

        var query = companyProfileQuery.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.Name.ToLower().Contains(input.Filter.ToLower()))
            .WhereIf(input.MarketId.HasValue, n => n.MarketId == input.MarketId)
            .WhereIf(input.ProductCategoryId.HasValue, n => n.ProductCategoryId == input.ProductCategoryId);
        var joinQuery = from companyProfile in query
            join market in marketQuery on companyProfile.MarketId equals market.Id
            join productCategory in productCategoryQuery on companyProfile.ProductCategoryId equals productCategory.Id
            select new CompanyProfileDto
            {
                Id = companyProfile.Id,
                Name = companyProfile.Name,
                MarketName = market.Name,
                ProductCategoryName = productCategory.Name,
                CreationTime = companyProfile.CreationTime
            };
        var result = joinQuery
            .OrderBy(input.Sorting ?? "Name")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<CompanyProfileDto>(joinQuery.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync()
    {
        var query = (await _companyProfileRepository.GetQueryableAsync())
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public override Task<CompanyProfileDto> CreateAsync(CreateUpdateCompanyProfileDto input)
    {
        input.TenantId = CurrentTenant.Id;
        var output = base.CreateAsync(input);
        if (output.Result != null && input.CertificateImages != null && input.CertificateImages.Any())
        {
            _imageStorageRepository.InsertManyAsync(input.CertificateImages.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Result.Id,
                RelatedEntityType = (int)ImageStorageEnum.CompanyProfileCertification,
                ImageName = n,
                TenantId = CurrentTenant.Id
            }).ToList());
        }

        return output;
    }
    
    public Task<CompanyProfileDto> CreateForGenQrCodeAsync(CreateUpdateCompanyProfileDto input)
    {
        var output = base.CreateAsync(input);
        if (output.Result != null && input.CertificateImages != null && input.CertificateImages.Any())
        {
            _imageStorageRepository.InsertManyAsync(input.CertificateImages.Select(n => new ImageStorage
            {
                RelatedEntityId = output.Result.Id,
                RelatedEntityType = (int)ImageStorageEnum.CompanyProfileCertification,
                ImageName = n,
                TenantId = input.TenantId
            }).ToList());
        }

        return output;
    }



    public override async Task<CompanyProfileDto> UpdateAsync(Guid id, CreateUpdateCompanyProfileDto input)
    {
        input.TenantId = CurrentTenant.Id;
        if (input.CertificateImages == null || !input.CertificateImages.Any())
        {
            return base.UpdateAsync(id, input).Result;
        }

        await _imageStorageRepository.DeleteAsync(n =>
            n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.CompanyProfileCertification);
        await _imageStorageRepository.InsertManyAsync(input.CertificateImages.Select(n => new ImageStorage
        {
            RelatedEntityId = id,
            RelatedEntityType = (int)ImageStorageEnum.CompanyProfileCertification,
            ImageName = n,
            TenantId = CurrentTenant.Id
        }).ToList());

        return await base.UpdateAsync(id, input);
    }

    public override async Task<CompanyProfileDto> GetAsync(Guid id)
    {
        var images = await _imageStorageRepository.GetListAsync(n =>
            n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.CompanyProfileCertification);
        var output = base.GetAsync(id);
        output.Result.CertificateImages = images.Select(n => n.ImageName).ToList();
        output.Result.CertificateImagesBase64 = new List<string>();
        foreach (var imageName in output.Result.CertificateImages)
        {
            output.Result.CertificateImagesBase64.Add(_storageAppService.GetBase64Image(imageName));
        }

        return output.Result;
    }
}