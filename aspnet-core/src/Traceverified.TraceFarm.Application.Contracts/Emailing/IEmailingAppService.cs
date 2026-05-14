using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.Emailing;

public interface IEmailingAppService :IApplicationService
{
    Task SendEmailToConfirmAsync(string email, string companyName, string url);
}