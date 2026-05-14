using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.Emailing;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Markets;
using Traceverified.TraceFarm.ProductManagements;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.TenantManagement;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public class GenerateQrCodeAppService(IRepository<Company, Guid> companyRepository,
    IStorageAppService storageAppService,
    ICompanyAppService companyAppService,
    ICompanyProfileAppService companyProfileAppService,
    IProductAppService productAppService,
    IMarketAppService marketAppService,
    IRepository<Tenant, Guid> tenantRepository,
    IDataFilter dataFilter,
    IRepository<CompanyProfile, Guid> companyProfileRepository,
    IConfirmationTokenAppService confirmationTokenAppService,
    IEmailingAppService emailingAppService
) : ApplicationService, IGenerateQrCodeAppService
{
    [AllowAnonymous]
    public async Task<CompanyForQrCodeDto?> GetCompanyByGs1CodeAsync(string gs1Code)
    {
        var company = await companyRepository.FirstOrDefaultAsync(n=>n.GS1Code == gs1Code);
        if (company == null)
        {
            return null;
        }
        var companyDto = ObjectMapper.Map<Company, CompanyForQrCodeDto>(company);
        if (companyDto.Logo != null)
        {
            companyDto.ImageUrl = storageAppService.GetBase64Image(companyDto.Logo);
        }
        var companyProfile = await companyProfileRepository.FirstOrDefaultAsync(n=>n.CompanyId == company.Id);
        if (companyProfile == null)
        {
            return companyDto;
        }

        companyDto.Description = companyProfile.Description;
        companyDto.CompanyProfileId = companyProfile.Id;
        companyDto.UpdateToken = await confirmationTokenAppService.GetTokenByCompanyIdAsync(company.Id);
        return companyDto;
    }
    public async Task<GenerateQrCodeResponseDto?> GetQrCodeInformationByTokenAsync(string inputToken)
    {
        var confirmationToken = await confirmationTokenAppService.GetTokenInfo(inputToken);
        if (confirmationToken == null)
        {
            throw new UserFriendlyException(L["InputTokenInvalid"]);
        }

        var product = await productAppService.GetProductForFreeQrCode(confirmationToken.ProductId);
        if (!product.CompanyId.HasValue || product.CompanyId.Value == Guid.Empty)
        {
            throw new UserFriendlyException(L["InputTokenInvalid"]);
        }
        var company = await companyRepository.FirstOrDefaultAsync(n=>n.Id == product.CompanyId.Value);
        if (company == null)
        {
            throw new UserFriendlyException(L["InputTokenInvalid"]);
        }
        
        var qrCodeInformation = ObjectMapper.Map<Company, GenerateQrCodeResponseDto>(company);
        if (company.Logo != null)
        {
            qrCodeInformation.CompanyLogo = storageAppService.GetBase64Image(company.Logo);
        }
        var companyProfile = await companyProfileRepository.FirstOrDefaultAsync(n=>n.CompanyId == company.Id);
        if (companyProfile == null)
        {
            return qrCodeInformation;
        }
        qrCodeInformation.CompanyDescription = companyProfile.Description;
        qrCodeInformation.ProductDescription = product.Description;
        qrCodeInformation.ProductName = product.ProductName;
        qrCodeInformation.ProductCategoryId = product.ProductCategoryId;
        qrCodeInformation.ProductGTINCode = product.GtinCode;
        qrCodeInformation.CompanyId = company.Id;
        qrCodeInformation.ProductId = product.Id;
        qrCodeInformation.CompanyProfileId = companyProfile.Id;
        return qrCodeInformation;
    }

    public async Task<bool> CheckGtinCode(string gtinCode)
    {
        return await productAppService.CheckGtinCode(gtinCode);
    }

    public async Task<GenerateQrCodeResponseDto> CreateQrCodeAsync(GenerateQrCodeDto input)
    {   
        var tenant = await tenantRepository.GetAsync(n=>n.Name == "default-for-free");
        if (tenant == null)
        {
            throw new UserFriendlyException(L["TenantDefaultNotFound"]);
        }
        var market = await marketAppService.GetMarketDefaultAsync();

        Company checkGs1Code;
        using (dataFilter.Disable<IMultiTenant>())
        {
            checkGs1Code = await companyRepository.FirstOrDefaultAsync(n=>n.GS1Code == input.GS1Code);
        }

        if (checkGs1Code == null)
        {
            var companyCreate = new CreateUpdateCompanyDto()
            {
                Name = input.Name,
                ProvinceId = input.ProvinceId,
                DistrictId = input.DistrictId,
                Logo = input.CompanyLogo,
                WardId = input.WardId,
                NationId = input.NationId,
                GS1Code = input.GS1Code,
                TenantId = tenant.Id,
                EmailAddress = input.EmailAddress,
                PhoneNumber = input.PhoneNumber,
                Address = input.Address,
                WebsiteUrl = input.WebsiteUrl,
                AdminEmailAddress = input.EmailAddress,
                AdminPassword = "1q2w3E*",
                TenantName = input.GS1Code,
                IsActive = false,
            };
            var newCompany = await companyAppService.CreateNotCreateTenantAsync(companyCreate);
            checkGs1Code = ObjectMapper.Map<CompanyDto, Company>(newCompany);
            input.TenantId = tenant.Id;
            var companyProfile = new CreateUpdateCompanyProfileDto
            {
                Name = input.Name,
                MarketId = market.Id,
                ProductCategoryId = input.ProductCategoryId,
                TenantId = tenant.Id,
                Description = input.CompanyDescription,
                CertificateImages = input.CompanyCertificationImages,
                CompanyName = input.Name,
                CompanyId = checkGs1Code.Id
            };
            await companyProfileAppService.CreateAsync(companyProfile);
        }
        
        var productCreate = new CreateUpdateProductForGenQrDto
        {
            GtinCode = input.ProductGTINCode,
            ProductName = input.ProductName,
            MarketId = market.Id,
            ProductCategoryId = input.ProductCategoryId,
            Link = "",
            Description = input.ProductDescription,
            Images = input.ProductImages,
            CertificationImages = input.ProductCertificationImages,
            TenantId = tenant.Id,
            CompanyId = checkGs1Code.Id
        };
       var product = await productAppService.CreateForGenQrAsync(productCreate);

       var confirmationToken = await confirmationTokenAppService.GenerateToken(product.Id);
      
        await emailingAppService.SendEmailToConfirmAsync(input.EmailAddress, input.Name, confirmationToken);
        var result = ObjectMapper.Map<GenerateQrCodeDto,GenerateQrCodeResponseDto>(input);
        result.CompanyId = checkGs1Code.Id;
        result.ProductId = product.Id;
        var token = confirmationToken.Split('/');
        result.UpdateToken = token.Last();
        return result;
    }

    public async Task<bool> UpdateCompanyEmail(UpdateCompanyInfoDto input)
    {
        var isEnableUpdate = await confirmationTokenAppService.CheckConfirmTokenAsync(input.UpdateToken);
        if (isEnableUpdate == EnumConfirmationToken.Null)
        {
            throw new UserFriendlyException(L["ConfirmationTokenNotFound"]);
        }
        var company = await companyRepository.FirstOrDefaultAsync(n=>n.GS1Code == input.GS1Code);
        if (company == null)
        {
            throw new UserFriendlyException(L["Gs1CodeNotFound"]);
        }
        company.EmailAddress = input.EmailAddress;
        await companyRepository.UpdateAsync(company);
        var url = await confirmationTokenAppService.UpdateExpirationTimeAsync(input.UpdateToken);
        
        //todo: Resend Email to confirm
        await emailingAppService.SendEmailToConfirmAsync(input.EmailAddress, company.Name, url);

        return true;
    }

    public async Task<bool> CheckEmailCompany(string emailInput)
    {
        return await companyRepository.AnyAsync(n => n.EmailAddress == emailInput);
    }
}