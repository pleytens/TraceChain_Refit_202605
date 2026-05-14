using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.GenerateQRCodeManagement;

public interface IGenerateQrCodeAppService: IApplicationService
{
    Task<CompanyForQrCodeDto?> GetCompanyByGs1CodeAsync(string gs1Code);
    Task<GenerateQrCodeResponseDto> CreateQrCodeAsync(GenerateQrCodeDto input);
    Task<bool> UpdateCompanyEmail(UpdateCompanyInfoDto input);
    Task<GenerateQrCodeResponseDto?> GetQrCodeInformationByTokenAsync(string inputToken);
    Task<bool> CheckGtinCode(string gtinCode);
    Task<bool> CheckEmailCompany(string emailInput);
}