using Traceverified.TraceFarm.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Traceverified.TraceFarm.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class TraceFarmController : AbpControllerBase
{
    protected TraceFarmController()
    {
        LocalizationResource = typeof(TraceFarmResource);
    }
}