using Traceverified.TraceFarm.Localization;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm;

/* Inherit your application services from this class.
 */
public abstract class TraceFarmAppService : ApplicationService
{
    protected TraceFarmAppService()
    {
        LocalizationResource = typeof(TraceFarmResource);
    }
}