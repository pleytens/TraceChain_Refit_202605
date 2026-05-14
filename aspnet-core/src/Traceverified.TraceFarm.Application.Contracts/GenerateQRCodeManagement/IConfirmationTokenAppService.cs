using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public interface IConfirmationTokenAppService: IApplicationService
{
    Task<string> GenerateToken(Guid productId);
    Task<string> UpdateExpirationTimeAsync(string token);
    Task SetProductExpirationTime(Guid productId);
    Task<EnumConfirmationToken> ConfirmTokenAsync(string token);
    Task<EnumConfirmationToken> CheckConfirmTokenAsync(string token);
    Task<string?> GetTokenByCompanyIdAsync(Guid companyId);
    Task<ConfirmationTokenDto> GetTokenInfo(string inputToken);
}