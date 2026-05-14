using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace Traceverified.TraceFarm;

[Dependency(ReplaceServices = true)]
public class TraceFarmBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "TraceFarm";
}