using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Emailing;
using Volo.Abp.TextTemplating;

namespace Traceverified.TraceFarm.Emailing
{
    public class EmailingAppService(
        ITemplateRenderer templateRenderer,
        IEmailSender emailSender)
        : ApplicationService, IEmailingAppService
    {
        public async Task SendEmailToConfirmAsync(string email, string companyName, string url)
        {
            var body = await templateRenderer.RenderAsync(
                CustomEmailTemplate.ConfirmCreateQR, 
                new ConfirmCreateQRLink
                {
                    CompanyName = companyName,
                    Link = url
                }
            );
            var subject = "[Traceverified No Reply] Confirm your email address";
            await emailSender.SendAsync(
                email,
                subject,
                body
            );

        }
    }
}
