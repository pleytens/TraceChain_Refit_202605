using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Traceverified.TraceFarm.ConfirmationTokens;
using Traceverified.TraceFarm.ProductManagements;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

[RemoteService(false)]
public class ConfirmationTokenAppService(IRepository<ConfirmationToken, Guid> confirmationTokenRepository,
        IRepository<ProductExpirationTime, Guid> productExpirationTimeRepository,
        IRepository<Product, Guid> productRepository,
        IConfiguration configuration
) : ApplicationService, IConfirmationTokenAppService
{   
    public async Task<string> GenerateToken(Guid productId)
    {
        var clientUrl= configuration["App:ClientUrl"];
        var confirmationTokenUrl = configuration["ConfirmationToken:Url"];
        var token = Guid.NewGuid().ToString();
        var expirationTime = DateTime.UtcNow.AddMinutes(5);
        var confirmationToken = new ConfirmationToken
        {
            Token = token,
            ExpirationTime = expirationTime,
            IsUsed = false,
            ProductId = productId
        };
        await confirmationTokenRepository.InsertAsync(confirmationToken);
        return $"{clientUrl}{confirmationTokenUrl}{token}";
    }
    public async Task<string> UpdateExpirationTimeAsync(string token)
    {
        var confirmationToken = await confirmationTokenRepository.FirstOrDefaultAsync(n=>n.Token == token);
        if (confirmationToken == null)
        {
            throw new UserFriendlyException(L["ConfirmationTokenNotFound"]);
        }

        var clientUrl= configuration["App:ClientUrl"];
        var confirmationTokenUrl = configuration["ConfirmationToken:Url"];
        confirmationToken.ExpirationTime = DateTime.UtcNow.AddMinutes(5);
        await confirmationTokenRepository.UpdateAsync(confirmationToken);

        return $"{clientUrl}{confirmationTokenUrl}{confirmationToken.Token}";
    }
    
    public async Task SetProductExpirationTime(Guid productId)
    {
        var expirationTime = DateTime.UtcNow.AddMonths(3);
        var productExpirationTime = new ProductExpirationTime
        {
            ExpirationTime = expirationTime,
            ProductId = productId
        };
        await productExpirationTimeRepository.InsertAsync(productExpirationTime);
    }

    public async Task<EnumConfirmationToken> ConfirmTokenAsync(string token)
    {
        var confirmationToken = await confirmationTokenRepository.FirstOrDefaultAsync(n=>n.Token == token);
        if (confirmationToken == null)
        {
            return EnumConfirmationToken.Null;
        }
        if (confirmationToken.IsUsed)
        {
            return EnumConfirmationToken.IsUsed;
        }

        if (confirmationToken.ExpirationTime < DateTime.UtcNow)
        {
            return EnumConfirmationToken.IsExpired;
        }
        confirmationToken.IsUsed = true;
        await confirmationTokenRepository.UpdateAsync(confirmationToken);
        await SetProductExpirationTime(confirmationToken.ProductId);
        return EnumConfirmationToken.Success;
    }
    
    public async Task<EnumConfirmationToken> CheckConfirmTokenAsync(string token)
    {
        var confirmationToken = await confirmationTokenRepository.FirstOrDefaultAsync(n=>n.Token == token);
        if (confirmationToken == null)
        {
            return EnumConfirmationToken.Null;
        }
        return confirmationToken.IsUsed ? EnumConfirmationToken.IsUsed : EnumConfirmationToken.Success;
    }

    public async Task<string?> GetTokenByCompanyIdAsync(Guid companyId)
    {
        var productByCompanyId = await productRepository.GetListAsync(n => n.CompanyId == companyId);
        if (productByCompanyId == null)
        {
            return null;
        }

        var confirmationToken = await confirmationTokenRepository.FirstOrDefaultAsync(n =>
            n.IsUsed && productByCompanyId.Select(g => g.Id).Contains(n.ProductId));
        return confirmationToken?.Token;
    }

    public async Task<ConfirmationTokenDto> GetTokenInfo(string inputToken)
    {
        var tokenInfo = await confirmationTokenRepository.FirstOrDefaultAsync(n => n.Token == inputToken);
        return ObjectMapper.Map<ConfirmationToken, ConfirmationTokenDto>(tokenInfo);
    }
}